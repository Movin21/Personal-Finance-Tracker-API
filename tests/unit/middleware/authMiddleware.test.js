const verifyToken = require('../../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    req = {
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  it('should call next() when token is valid', () => {
    // Setup request with valid token
    req.headers.authorization = 'Bearer validtoken';
    
    // Mock jwt.verify to return decoded token
    const mockDecodedToken = { id: 'user123', role: 'user' };
    jwt.verify.mockReturnValue(mockDecodedToken);
    
    // Call the middleware
    verifyToken(req, res, next);
    
    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockDecodedToken);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no authorization header is provided', () => {
    // Call the middleware without authorization header
    verifyToken(req, res, next);
    
    // Assertions
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No Token Found, Unauthorized' });
  });
  
  it('should return 401 when authorization header does not start with "Bearer "', () => {
    // Setup request with invalid authorization format
    req.headers.authorization = 'invalidformat';
    
    // Call the middleware
    verifyToken(req, res, next);
    
    // Assertions
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No Token Found, Unauthorized' });
  });
  
  it('should return 401 when token is invalid', () => {
    // Setup request with token
    req.headers.authorization = 'Bearer invalidtoken';
    
    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    // Call the middleware
    verifyToken(req, res, next);
    
    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token, Unauthorized' });
  });
  
  it('should accept token from Authorization header with capital A', () => {
    // Setup request with valid token in Authorization header
    req.headers.Authorization = 'Bearer validtoken';
    
    // Mock jwt.verify to return decoded token
    const mockDecodedToken = { id: 'user123', role: 'user' };
    jwt.verify.mockReturnValue(mockDecodedToken);
    
    // Call the middleware
    verifyToken(req, res, next);
    
    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockDecodedToken);
    expect(next).toHaveBeenCalled();
  });
});