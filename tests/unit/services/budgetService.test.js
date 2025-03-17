const { checkBudgets } = require('../../../src/services/budgetService');
const Budget = require('../../../src/models/budgetModel');
const Transaction = require('../../../src/models/transactionModel');
const Notification = require('../../../src/models/notificationModel');

// Mock dependencies
jest.mock('../../../src/models/budgetModel');
jest.mock('../../../src/models/transactionModel');
jest.mock('../../../src/models/notificationModel');

describe('Budget Service', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('checkBudgets', () => {
    it('should create a notification when budget is exceeded', async () => {
      // Mock budget data
      const mockBudget = {
        _id: 'budget123',
        user: 'user123',
        type: 'monthly',
        month: '2023-06-01',
        amount: 500,
        currentSpending: 450, // Current spending less than budget
        warningThreshold: 80,
        save: jest.fn().mockResolvedValue(undefined)
      };
      
      // Mock transactions that exceed the budget
      const mockTransactions = [
        { amount: 300 },
        { amount: 250 }
      ];
      
      // Setup mocks
      Budget.find = jest.fn().mockResolvedValue([mockBudget]);
      Transaction.find = jest.fn().mockResolvedValue(mockTransactions);
      Notification.create = jest.fn().mockResolvedValue({});
      
      await checkBudgets();
      
      // Assertions
      expect(Budget.find).toHaveBeenCalledWith({});
      expect(Transaction.find).toHaveBeenCalledWith({
        user: 'user123',
        type: 'expense',
        date: expect.any(Object)
      });
      
      // Total spent is 550, which exceeds budget of 500
      expect(Notification.create).toHaveBeenCalledWith({
        user: 'user123',
        type: 'budget_exceeded',
        message: expect.stringContaining('Budget exceeded for monthly budget')
      });
      
      // Budget should be updated with current spending
      expect(mockBudget.currentSpending).toBe(550);
      expect(mockBudget.save).toHaveBeenCalled();
    });
    
    it('should create a warning notification when approaching budget threshold', async () => {
      // Mock budget data
      const mockBudget = {
        _id: 'budget123',
        user: 'user123',
        type: 'category',
        category: 'Food',
        amount: 500,
        currentSpending: 350, // Current spending at 70%
        warningThreshold: 80,
        save: jest.fn().mockResolvedValue(undefined)
      };
      
      // Mock transactions that approach the warning threshold
      const mockTransactions = [
        { amount: 250 },
        { amount: 200 }
      ];
      
      // Setup mocks
      Budget.find = jest.fn().mockResolvedValue([mockBudget]);
      Transaction.find = jest.fn().mockResolvedValue(mockTransactions);
      Notification.create = jest.fn().mockResolvedValue({});
      
      await checkBudgets();
      
      // Assertions
      expect(Budget.find).toHaveBeenCalledWith({});
      expect(Transaction.find).toHaveBeenCalledWith({
        user: 'user123',
        type: 'expense',
        category: 'Food'
      });
      
      // Total spent is 450, which is 90% of budget (500)
      expect(Notification.create).toHaveBeenCalledWith({
        user: 'user123',
        type: 'budget_warning',
        message: expect.stringContaining('Approaching budget limit for Food budget')
      });
      
      // Budget should be updated with current spending
      expect(mockBudget.currentSpending).toBe(450);
      expect(mockBudget.save).toHaveBeenCalled();
    });
    
    it('should not create notification when spending is below threshold', async () => {
      // Mock budget data
      const mockBudget = {
        _id: 'budget123',
        user: 'user123',
        type: 'category',
        category: 'Entertainment',
        amount: 500,
        currentSpending: 300,
        warningThreshold: 80,
        save: jest.fn().mockResolvedValue(undefined)
      };
      
      // Mock transactions below warning threshold
      const mockTransactions = [
        { amount: 150 },
        { amount: 150 }
      ];
      
      // Setup mocks
      Budget.find = jest.fn().mockResolvedValue([mockBudget]);
      Transaction.find = jest.fn().mockResolvedValue(mockTransactions);
      Notification.create = jest.fn().mockResolvedValue({});
      
      await checkBudgets();
      
      // Assertions
      expect(Budget.find).toHaveBeenCalledWith({});
      expect(Transaction.find).toHaveBeenCalledWith({
        user: 'user123',
        type: 'expense',
        category: 'Entertainment'
      });
      
      // Total spent is 300, which is 60% of budget (500) - below threshold
      expect(Notification.create).not.toHaveBeenCalled();
      
      // Budget should still be updated with current spending
      expect(mockBudget.currentSpending).toBe(300);
      expect(mockBudget.save).toHaveBeenCalled();
    });
    
    it('should handle errors gracefully', async () => {
      // Mock error
      const mockError = new Error('Database error');
      Budget.find = jest.fn().mockRejectedValue(mockError);
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await checkBudgets();
      
      // Assertions
      expect(consoleSpy).toHaveBeenCalledWith('Error checking budgets:', mockError);
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });
});