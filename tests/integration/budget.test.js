const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../src/models/userModel');
const Budget = require('../../src/models/budgetModel');
const Transaction = require('../../src/models/transactionModel');

describe('Budget API Integration Tests', () => {
  let userToken;
  let userId;
  let budgetId;

  // Setup test data before all tests
  beforeAll(async () => {
    // Clear test collections
    await User.deleteMany({});
    await Budget.deleteMany({});
    await Transaction.deleteMany({});

    // Create test user
    const user = await User.create({
      username: 'budget_test_user',
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

    // Create test transactions for budget analytics
    await Transaction.create([
      {
        user: userId,
        type: 'expense',
        amount: 500,
        category: 'Groceries',
        description: 'Weekly groceries',
        date: new Date()
      },
      {
        user: userId,
        type: 'expense',
        amount: 100,
        category: 'Entertainment',
        description: 'Movie tickets',
        date: new Date()
      }
    ]);
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Budget.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/budgets', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({
          type: 'monthly',
          amount: 3000,
          month: new Date().toISOString(),
          warningThreshold: 80
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should create a new monthly budget for authenticated user', async () => {
      const newBudget = {
        type: 'monthly',
        amount: 3000,
        month: new Date().toISOString(),
        warningThreshold: 80
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newBudget);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(newBudget.type);
      expect(response.body.amount).toBe(newBudget.amount);
      expect(response.body.warningThreshold).toBe(newBudget.warningThreshold);
      expect(response.body.user.toString()).toBe(userId.toString());

      // Save budget ID for later tests
      budgetId = response.body._id;
    });

    it('should create a new category budget for authenticated user', async () => {
      const newBudget = {
        type: 'category',
        category: 'Groceries',
        amount: 600,
        warningThreshold: 75
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newBudget);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(newBudget.type);
      expect(response.body.category).toBe(newBudget.category);
      expect(response.body.amount).toBe(newBudget.amount);
      expect(response.body.warningThreshold).toBe(newBudget.warningThreshold);
    });
  });

  describe('GET /api/budgets', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/budgets');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return all budgets for authenticated user', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('_id');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('warningThreshold');
    });
  });

  describe('PUT /api/budgets/:id', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .send({
          amount: 3500,
          warningThreshold: 85
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should update an existing budget', async () => {
      const updatedData = {
        amount: 3500,
        warningThreshold: 85
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', budgetId);
      expect(response.body.amount).toBe(updatedData.amount);
      expect(response.body.warningThreshold).toBe(updatedData.warningThreshold);
    });

    it('should return 404 for non-existent budget ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 2000 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Budget not found');
    });
  });

  describe('GET /api/budgets/analytics', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/budgets/analytics');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return budget analytics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/budgets/analytics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // If we have budgets, verify the analytics structure
      if (response.body.length > 0) {
        const analytics = response.body[0];
        expect(analytics).toHaveProperty('budget');
        expect(analytics).toHaveProperty('totalSpent');
        expect(analytics).toHaveProperty('percentageUsed');
        expect(analytics).toHaveProperty('remaining');
        expect(analytics).toHaveProperty('status');
        
        // Verify status is one of the expected values
        expect(['safe', 'warning', 'exceeded']).toContain(analytics.status);
      }
    });
  });

  describe('GET /api/budgets/recommendations', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/budgets/recommendations');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return budget recommendations for authenticated user', async () => {
      const response = await request(app)
        .get('/api/budgets/recommendations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('message');
    });
  });
});