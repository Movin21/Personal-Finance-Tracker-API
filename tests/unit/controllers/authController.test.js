const { register, login } = require('../../../src/controllers/authcontrollers');
const User = require('../../../src/models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        password: 'password123',
        role: 'user'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedpassword');
      
      // Mock User constructor and save method
      const mockUserInstance = {
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.mockImplementation(() => mockUserInstance);
      
      await register(req, res);
      
      // Assertions
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User testuser registration successful'
      });
    });
    
    it('should handle errors during registration', async () => {
      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedpassword');
      
      // Mock User constructor and save method with error
      const mockError = new Error('Database error');
      const mockUserInstance = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      User.mockImplementation(() => mockUserInstance);
      
      await register(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User Registration Controller Error : Database error'
      });
    });
  });
  
  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Mock user find
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock password comparison
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock JWT sign
      jwt.sign.mockReturnValue('mockedtoken');
      
      await login(req, res);
      
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mockedtoken'
      });
    });
    
    it('should return 404 if user is not found', async () => {
      // Mock user find - user not found
      User.findOne.mockResolvedValue(null);
      
      await login(req, res);
      
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'testuser User not found'
      });
    });
    
    it('should return 400 if password is invalid', async () => {
      // Mock user find
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Mock password comparison - invalid password
      bcrypt.compare.mockResolvedValue(false);
      
      await login(req, res);
      
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
    
    it('should handle errors during login', async () => {
      // Mock user find with error
      const mockError = new Error('Database error');
      User.findOne.mockRejectedValue(mockError);
      
      await login(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User Login Controller Error : Database error'
      });
    });
  });
});