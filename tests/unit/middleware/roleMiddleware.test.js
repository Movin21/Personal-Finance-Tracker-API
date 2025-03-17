const userRole = require('../../../src/middleware/roleMiddleware');

describe('Role Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    req = {
      user: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  it('should call next() when user has the required role', () => {
    // Setup request with user having admin role
    req.user.role = 'admin';
    
    // Create middleware with admin role requirement
    const middleware = userRole('admin');
    
    // Call the middleware
    middleware(req, res, next);
    
    // Assertions
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should call next() when user has one of the required roles', () => {
    // Setup request with user having user role
    req.user.role = 'user';
    
    // Create middleware with multiple role requirements
    const middleware = userRole('user', 'admin');
    
    // Call the middleware
    middleware(req, res, next);
    
    // Assertions
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 403 when user does not have the required role', () => {
    // Setup request with user having user role
    req.user.role = 'user';
    
    // Create middleware with admin role requirement
    const middleware = userRole('admin');
    
    // Call the middleware
    middleware(req, res, next);
    
    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid User Role, Forbidden' });
  });
  
  it('should return 403 when user does not have any of the required roles', () => {
    // Setup request with user having guest role
    req.user.role = 'guest';
    
    // Create middleware with multiple role requirements
    const middleware = userRole('user', 'admin');
    
    // Call the middleware
    middleware(req, res, next);
    
    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid User Role, Forbidden' });
  });
});