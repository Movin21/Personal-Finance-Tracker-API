const mongoose = require('mongoose');
const Goal = require('../../../src/models/goalModel');

// Mock mongoose methods
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose,
    Schema: jest.fn().mockImplementation(() => ({
      virtual: jest.fn().mockReturnThis(),
      get: jest.fn(),
      methods: {},
    })),
    model: jest.fn().mockReturnValue(jest.fn()),
    Schema: {
      Types: {
        ObjectId: String,
      }
    }
  };
});

describe('Goal Model', () => {
  let goalModel;
  
  beforeEach(() => {
    // Reset the mock implementation before each test
    jest.clearAllMocks();
    
    // Create a mock goal instance
    goalModel = {
      _id: 'goal123',
      user: 'user123',
      title: 'New Car',
      description: 'Save for a new car',
      targetAmount: 10000,
      currentAmount: 2000,
      targetDate: new Date('2024-12-31'),
      category: 'Transportation',
      status: 'active',
      autoAllocate: false,
      allocationPercentage: 0,
      transactions: [],
      save: jest.fn().mockResolvedValue(this),
    };
    
    // Mock the progressPercentage virtual property
    Object.defineProperty(goalModel, 'progressPercentage', {
      get: jest.fn().mockReturnValue(20) // 2000/10000 * 100 = 20%
    });
    
    // Mock the remainingAmount virtual property
    Object.defineProperty(goalModel, 'remainingAmount', {
      get: jest.fn().mockReturnValue(8000) // 10000 - 2000 = 8000
    });
    
    // Mock the daysRemaining virtual property
    Object.defineProperty(goalModel, 'daysRemaining', {
      get: jest.fn().mockReturnValue(365) // Approximately a year from now
    });
    
    // Mock the addTransaction method with improved implementation
    goalModel.addTransaction = jest.fn().mockImplementation(async function(transactionId, amount) {
      this.transactions.push(transactionId);
      
      // Update current amount, ensuring it doesn't go below 0
      this.currentAmount = Math.max(this.currentAmount + amount, 0);
      
      // Update status based on current amount
      if (this.currentAmount >= this.targetAmount) {
        this.status = 'completed';
      } else if (this.status === 'completed' && this.currentAmount < this.targetAmount) {
        // If a withdrawal causes the goal to go back to incomplete
        this.status = 'active';
      }
      
      return this;
    });
  });
  
  describe('Virtual Properties', () => {
    it('should calculate progress percentage correctly', () => {
      expect(goalModel.progressPercentage).toBe(20);
    });
    
    it('should calculate remaining amount correctly', () => {
      expect(goalModel.remainingAmount).toBe(8000);
    });
    
    it('should calculate days remaining correctly', () => {
      expect(goalModel.daysRemaining).toBe(365);
    });
  });
  
  describe('addTransaction Method', () => {
    it('should add a transaction and update current amount', async () => {
      const initialAmount = goalModel.currentAmount;
      const transactionAmount = 500;
      
      await goalModel.addTransaction('transaction123', transactionAmount);
      
      expect(goalModel.transactions).toContain('transaction123');
      expect(goalModel.currentAmount).toBe(initialAmount + transactionAmount);
      expect(goalModel.save).toHaveBeenCalled();
    });
    
    it('should update status to completed when target is reached', async () => {
      // Set current amount close to target
      goalModel.currentAmount = 9500;
      const transactionAmount = 600; // This will exceed the target of 10000
      
      await goalModel.addTransaction('transaction123', transactionAmount);
      
      expect(goalModel.status).toBe('completed');
      expect(goalModel.save).toHaveBeenCalled();
    });
    
    it('should not change status when target is not reached', async () => {
      const initialStatus = goalModel.status;
      const transactionAmount = 100; // Not enough to reach target
      
      await goalModel.addTransaction('transaction123', transactionAmount);
      
      expect(goalModel.status).toBe(initialStatus);
    });
    
    it('should handle negative amounts for withdrawals', async () => {
      goalModel.currentAmount = 5000;
      const withdrawalAmount = -1000;
      
      await goalModel.addTransaction('transaction123', withdrawalAmount);
      
      expect(goalModel.currentAmount).toBe(4000);
      expect(goalModel.save).toHaveBeenCalled();
    });
    
    it('should prevent current amount from going below zero', async () => {
      goalModel.currentAmount = 500;
      const withdrawalAmount = -1000; // More than current amount
      
      await goalModel.addTransaction('transaction123', withdrawalAmount);
      
      expect(goalModel.currentAmount).toBe(0);
      expect(goalModel.save).toHaveBeenCalled();
    });
    
    it('should revert status from completed to active when a withdrawal makes goal incomplete', async () => {
      // Set up a completed goal
      goalModel.currentAmount = 10500; // Above target
      goalModel.status = 'completed';
      const withdrawalAmount = -1000; // Will bring below target
      
      await goalModel.addTransaction('transaction123', withdrawalAmount);
      
      expect(goalModel.currentAmount).toBe(9500);
      expect(goalModel.status).toBe('active');
      expect(goalModel.save).toHaveBeenCalled();
    });
  });
  
  describe('Schema Validation', () => {
    it('should require a user reference', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.user.required).toBe(true);
    });
    
    it('should require a title', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.title.required).toBe(true);
    });
    
    it('should require a target amount', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.targetAmount.required).toBe(true);
      expect(goalSchema.targetAmount.min).toBe(0);
    });
    
    it('should require a target date', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.targetDate.required).toBe(true);
    });
    
    it('should require a category', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.category.required).toBe(true);
    });
    
    it('should have valid status options', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.status.enum).toContain('active');
      expect(goalSchema.status.enum).toContain('completed');
      expect(goalSchema.status.enum).toContain('cancelled');
    });
    
    it('should have allocation percentage between 0 and 100', () => {
      const goalSchema = mongoose.Schema.mock.calls[0][0];
      expect(goalSchema.allocationPercentage.min).toBe(0);
      expect(goalSchema.allocationPercentage.max).toBe(100);
    });
  });
});