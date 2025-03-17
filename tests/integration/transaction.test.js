const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../src/models/userModel');
const Transaction = require('../../src/models/transactionModel');

describe('Transaction API Integration Tests', () => {
  let userToken;
  let userId;
  let transactionId;

  // Setup test data before all tests
  beforeAll(async () => {
    // Clear test collections
    await User.deleteMany({});
    await Transaction.deleteMany({});

    // Create test user
    const user = await User.create({
      username: 'transaction_test_user',
      password: 'password123',
      role: 'user'
    });

    userId = user._id;

    // Generate token
    userToken = jwt.sign(
      { id: userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/transactions', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          type: 'income',
          amount: 1000,
          category: 'Salary',
          description: 'Monthly salary'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should create a new transaction for authenticated user', async () => {
      const newTransaction = {
        type: 'income',
        amount: 1000,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTransaction);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(newTransaction.type);
      expect(response.body.amount).toBe(newTransaction.amount);
      expect(response.body.category).toBe(newTransaction.category);
      expect(response.body.description).toBe(newTransaction.description);
      expect(response.body.user.toString()).toBe(userId.toString());

      // Save transaction ID for later tests
      transactionId = response.body._id;
    });
  });

  describe('GET /api/transactions', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/transactions');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return all transactions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('_id');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('category');
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get(`/api/transactions/${transactionId}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return a specific transaction by ID', async () => {
      const response = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', transactionId);
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent transaction ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transaction not found');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send({
          amount: 1500,
          description: 'Updated salary'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should update an existing transaction', async () => {
      const updatedData = {
        amount: 1500,
        description: 'Updated salary'
      };

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', transactionId);
      expect(response.body.amount).toBe(updatedData.amount);
      expect(response.body.description).toBe(updatedData.description);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).delete(`/api/transactions/${transactionId}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should delete an existing transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transaction deleted successfully');

      // Verify transaction is actually deleted
      const getResponse = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});