const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  allocateIncomeToGoals
} = require('../../../src/controllers/goalController');
const Goal = require('../../../src/models/goalModel');
const Transaction = require('../../../src/models/transactionModel');

// Mock dependencies
jest.mock('../../../src/models/goalModel');
jest.mock('../../../src/models/transactionModel');

describe('Goal Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {
        title: 'New Car',
        description: 'Save for a new car',
        targetAmount: 10000,
        targetDate: '2024-12-31',
        category: 'Transportation',
        autoAllocate: false,
        allocationPercentage: 0
      },
      user: {
        id: 'user123'
      },
      params: {
        id: 'goal123'
      },
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('createGoal', () => {
    it('should create a new goal successfully', async () => {
      // Mock Goal constructor and save method
      const mockGoalData = {
        _id: 'goal123',
        ...req.body,
        user: req.user.id
      };
      
      const mockGoalInstance = {
        ...mockGoalData,
        save: jest.fn().mockResolvedValue(mockGoalData)
      };
      
      Goal.mockImplementation(() => mockGoalInstance);
      
      await createGoal(req, res);
      
      // Assertions
      expect(Goal).toHaveBeenCalledWith({
        ...req.body,
        user: req.user.id
      });
      expect(mockGoalInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'goal123',
        title: 'New Car',
        targetAmount: 10000
      }));
    });
    
    it('should handle errors during goal creation', async () => {
      // Mock Goal constructor and save method with error
      const mockError = new Error('Database error');
      const mockGoalInstance = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      Goal.mockImplementation(() => mockGoalInstance);
      
      await createGoal(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
  
  describe('getGoals', () => {
    it('should get all goals for a user', async () => {
      // Mock goals
      const mockGoals = [
        { _id: 'goal1', title: 'New Car', targetAmount: 10000, user: 'user123' },
        { _id: 'goal2', title: 'Vacation', targetAmount: 5000, user: 'user123' }
      ];
      
      // Mock Goal.find
      Goal.find = jest.fn().mockReturnThis();
      Goal.sort = jest.fn().mockResolvedValue(mockGoals);
      
      await getGoals(req, res);
      
      // Assertions
      expect(Goal.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });
    
    it('should filter goals by status and category', async () => {
      // Set query parameters
      req.query = { status: 'active', category: 'Transportation' };
      
      // Mock goals
      const mockGoals = [
        { _id: 'goal1', title: 'New Car', status: 'active', category: 'Transportation', user: 'user123' }
      ];
      
      // Mock Goal.find
      Goal.find = jest.fn().mockReturnThis();
      Goal.sort = jest.fn().mockResolvedValue(mockGoals);
      
      await getGoals(req, res);
      
      // Assertions
      expect(Goal.find).toHaveBeenCalledWith({
        user: 'user123',
        status: 'active',
        category: 'Transportation'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });
    
    it('should handle errors when getting goals', async () => {
      // Mock Goal.find with error
      const mockError = new Error('Database error');
      Goal.find = jest.fn().mockReturnThis();
      Goal.sort = jest.fn().mockRejectedValue(mockError);
      
      await getGoals(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
  
  describe('getGoalById', () => {
    it('should get a goal by ID', async () => {
      // Mock goal
      const mockGoal = {
        _id: 'goal123',
        title: 'New Car',
        targetAmount: 10000,
        user: 'user123',
        transactions: []
      };
      
      // Mock Goal.findOne and populate
      Goal.findOne = jest.fn().mockReturnThis();
      Goal.populate = jest.fn().mockResolvedValue(mockGoal);
      
      await getGoalById(req, res);
      
      // Assertions
      expect(Goal.findOne).toHaveBeenCalledWith({ _id: 'goal123', user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoal);
    });
    
    it('should return 404 if goal is not found', async () => {
      // Mock Goal.findOne and populate returning null
      Goal.findOne = jest.fn().mockReturnThis();
      Goal.populate = jest.fn().mockResolvedValue(null);
      
      await getGoalById(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Goal not found'
      }));
    });
  });
  
  describe('updateGoal', () => {
    it('should update a goal successfully', async () => {
      // Mock updated goal
      const updatedGoal = {
        _id: 'goal123',
        title: 'Updated Car Goal',
        targetAmount: 12000,
        user: 'user123'
      };
      
      // Mock Goal.findOneAndUpdate
      Goal.findOneAndUpdate = jest.fn().mockResolvedValue(updatedGoal);
      
      await updateGoal(req, res);
      
      // Assertions
      expect(Goal.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'goal123', user: 'user123' },
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedGoal);
    });
    
    it('should return 404 if goal is not found', async () => {
      // Mock Goal.findOneAndUpdate returning null
      Goal.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      
      await updateGoal(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Goal not found'
      }));
    });
  });
  
  describe('deleteGoal', () => {
    it('should delete a goal successfully', async () => {
      // Mock deleted goal
      const deletedGoal = {
        _id: 'goal123',
        title: 'New Car',
        user: 'user123'
      };
      
      // Mock Goal.findOneAndDelete
      Goal.findOneAndDelete = jest.fn().mockResolvedValue(deletedGoal);
      
      await deleteGoal(req, res);
      
      // Assertions
      expect(Goal.findOneAndDelete).toHaveBeenCalledWith({ _id: 'goal123', user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Goal deleted successfully'
      }));
    });
    
    it('should return 404 if goal is not found', async () => {
      // Mock Goal.findOneAndDelete returning null
      Goal.findOneAndDelete = jest.fn().mockResolvedValue(null);
      
      await deleteGoal(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Goal not found'
      }));
    });
  });
  
  describe('addContribution', () => {
    it('should add a contribution to a goal', async () => {
      // Set request body for contribution
      req.body = {
        amount: 500,
        description: 'Monthly contribution'
      };
      
      // Mock goal
      const mockGoal = {
        _id: 'goal123',
        title: 'New Car',
        targetAmount: 10000,
        currentAmount: 1000,
        user: 'user123',
        addTransaction: jest.fn().mockResolvedValue({
          _id: 'goal123',
          title: 'New Car',
          targetAmount: 10000,
          currentAmount: 1500,
          user: 'user123'
        })
      };
      
      // Mock transaction
      const mockTransaction = {
        _id: 'transaction123',
        save: jest.fn().mockResolvedValue({})
      };
      
      // Mock Goal.findOne
      Goal.findOne = jest.fn().mockResolvedValue(mockGoal);
      
      // Mock Transaction constructor
      Transaction.mockImplementation(() => mockTransaction);
      
      await addContribution(req, res);
      
      // Assertions
      expect(Goal.findOne).toHaveBeenCalledWith({ _id: 'goal123', user: 'user123' });
      expect(Transaction).toHaveBeenCalledWith(expect.objectContaining({
        user: 'user123',
        type: 'expense',
        amount: 500,
        category: 'Savings'
      }));
      expect(mockTransaction.save).toHaveBeenCalled();
      expect(mockGoal.addTransaction).toHaveBeenCalledWith('transaction123', 500);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should return 404 if goal is not found', async () => {
      // Mock Goal.findOne returning null
      Goal.findOne = jest.fn().mockResolvedValue(null);
      
      await addContribution(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Goal not found'
      }));
    });
  });
});