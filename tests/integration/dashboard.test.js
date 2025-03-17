const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server'); // Import the Express app
const User = require('../../src/models/userModel');
const Transaction = require('../../src/models/transactionModel');
const Budget = require('../../src/models/budgetModel');
const Goal = require('../../src/models/goalModel');
const Notification = require('../../src/models/notificationModel');

describe('Dashboard API Integration Tests', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  // Setup test data before all tests
  beforeAll(async () => {
    // Clear test collections
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    const adminUser = await User.create({
      username: 'admin_test',
      password: 'password123',
      role: 'admin'
    });
    
    const regularUser = await User.create({
      username: 'user_test',
      password: 'password123',
      role: 'user'
    });

    adminId = adminUser._id;
    userId = regularUser._id;

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminId, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test transactions for the regular user
    await Transaction.create([
      {
        user: userId,
        type: 'income',
        amount: 5000,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date()
      },
      {
        user: userId,
        type: 'expense',
        amount: 1000,
        category: 'Rent',
        description: 'Monthly rent',
        date: new Date()
      },
      {
        user: userId,
        type: 'expense',
        amount: 200,
        category: 'Groceries',
        description: 'Weekly groceries',
        date: new Date()
      }
    ]);

    // Create test budget for the regular user
    await Budget.create({
      user: userId,
      type: 'monthly',
      amount: 3000,
      month: new Date(),
      warningThreshold: 80
    });

    // Create test goal for the regular user
    await Goal.create({
      user: userId,
      title: 'Vacation',
      description: 'Summer vacation fund',
      targetAmount: 2000,
      currentAmount: 500,
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      category: 'Travel',
      status: 'active'
    });

    // Create test notification for the regular user
    await Notification.create({
      user: userId,
      message: 'You are approaching your monthly budget limit',
      type: 'warning',
      isRead: false
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/dashboard/admin', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/dashboard/admin');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return 403 if user token is used to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('should return admin dashboard data for admin users', async () => {
      const response = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userStats');
      expect(response.body).toHaveProperty('activityStats');
      expect(response.body).toHaveProperty('financialSummary');
      expect(response.body).toHaveProperty('recentActivity');
      
      // Verify specific data
      expect(response.body.userStats).toHaveProperty('totalUsers');
      expect(response.body.userStats).toHaveProperty('newUsersThisMonth');
      expect(response.body.activityStats).toHaveProperty('totalTransactions');
      expect(response.body.financialSummary).toHaveProperty('income');
      expect(response.body.financialSummary).toHaveProperty('expenses');
      expect(response.body.financialSummary).toHaveProperty('topCategories');
    });
  });

  describe('GET /api/dashboard/user', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/dashboard/user');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No Token Found, Unauthorized');
    });

    it('should return user dashboard data for regular users', async () => {
      const response = await request(app)
        .get('/api/dashboard/user')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recentTransactions');
      expect(response.body).toHaveProperty('budgetSummary');
      expect(response.body).toHaveProperty('goals');
      expect(response.body).toHaveProperty('spendingTrends');
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('monthlyFinancials');
      
      // Verify specific data
      expect(response.body.recentTransactions).toBeInstanceOf(Array);
      expect(response.body.budgetSummary).toBeInstanceOf(Array);
      expect(response.body.goals).toBeInstanceOf(Array);
      expect(response.body.monthlyFinancials).toHaveProperty('income');
      expect(response.body.monthlyFinancials).toHaveProperty('expenses');
      expect(response.body.monthlyFinancials).toHaveProperty('balance');
    });

    it('should allow admin users to access user dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/user')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recentTransactions');
    });
  });
});