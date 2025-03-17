const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../../../src/controllers/transactionController');
const Transaction = require('../../../src/models/transactionModel');

// Mock dependencies
jest.mock('../../../src/models/transactionModel');

describe('Transaction Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {
        amount: 100,
        category: 'Food',
        description: 'Grocery shopping',
        date: '2023-06-15',
        type: 'expense'
      },
      user: {
        id: 'user123'
      },
      params: {
        id: 'transaction123'
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
  
  describe('createTransaction', () => {
    it('should create a new transaction successfully', async () => {
      // Mock User model and findById
      const User = require('../../../src/models/userModel');
      jest.mock('../../../src/models/userModel');
      User.findById = jest.fn().mockResolvedValue({
        preferredCurrency: 'USD'
      });
      
      // Mock Transaction constructor and save method
      const mockTransactionInstance = {
        _id: 'transaction123',
        ...req.body,
        user: req.user.id,
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          ...req.body,
          user: req.user.id
        })
      };
      Transaction.mockImplementation(() => mockTransactionInstance);
      
      await createTransaction(req, res);
      
      // Assertions
      expect(Transaction).toHaveBeenCalledWith(expect.objectContaining({
        ...req.body,
        user: req.user.id
      }));
      expect(mockTransactionInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransactionInstance);
    });
    
    it('should handle errors during transaction creation', async () => {
      // Mock Transaction constructor and save method with error
      const mockError = new Error('Database error');
      const mockTransactionInstance = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      Transaction.mockImplementation(() => mockTransactionInstance);
      
      await createTransaction(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
  
  describe('getTransactions', () => {
    it('should get all transactions for a user', async () => {
      // Mock transactions
      const mockTransactions = [
        { _id: 'transaction1', amount: 100, category: 'Food', user: 'user123' },
        { _id: 'transaction2', amount: 50, category: 'Transport', user: 'user123' }
      ];
      
      // Mock Transaction.find
      Transaction.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTransactions)
      });
      
      await getTransactions(req, res);
      
      // Assertions
      expect(Transaction.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });
    
    it('should handle errors when getting transactions', async () => {
      // Mock Transaction.find with error
      const mockError = new Error('Database error');
      Transaction.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(mockError)
      });
      
      await getTransactions(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
  
  describe('updateTransaction', () => {
    it('should update a transaction successfully', async () => {
      // Mock updated transaction
      const updatedTransaction = {
        _id: 'transaction123',
        amount: 150,
        category: 'Food',
        description: 'Updated grocery shopping',
        user: 'user123'
      };
      
      // Mock Transaction.findOneAndUpdate
      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(updatedTransaction);
      
      await updateTransaction(req, res);
      
      // Assertions
      expect(Transaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'transaction123', user: 'user123' },
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedTransaction);
    });
    
    it('should return 404 if transaction is not found', async () => {
      // Mock Transaction.findOneAndUpdate - transaction not found
      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      
      await updateTransaction(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not found')
      }));
    });
    
    it('should handle errors during transaction update', async () => {
      // Mock Transaction.findOneAndUpdate with error
      const mockError = new Error('Database error');
      Transaction.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);
      
      await updateTransaction(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
  
  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      // Mock deleted transaction
      const deletedTransaction = {
        _id: 'transaction123',
        amount: 100,
        category: 'Food',
        user: 'user123'
      };
      
      // Mock Transaction.findOneAndDelete
      Transaction.findOneAndDelete = jest.fn().mockResolvedValue(deletedTransaction);
      
      await deleteTransaction(req, res);
      
      // Assertions
      expect(Transaction.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'transaction123',
        user: 'user123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('deleted')
      }));
    });
    
    it('should return 404 if transaction is not found', async () => {
      // Mock Transaction.findOneAndDelete - transaction not found
      Transaction.findOneAndDelete = jest.fn().mockResolvedValue(null);
      
      await deleteTransaction(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not found')
      }));
    });
    
    it('should handle errors during transaction deletion', async () => {
      // Mock Transaction.findOneAndDelete with error
      const mockError = new Error('Database error');
      Transaction.findOneAndDelete = jest.fn().mockRejectedValue(mockError);
      
      await deleteTransaction(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
    });
  });
});