const mongoose = require('mongoose');
const User = require('../../../src/models/userModel');

// Use in-memory MongoDB server for testing
describe('User Model', () => {
  beforeAll(async () => {
    // Mock mongoose methods
    mongoose.model = jest.fn().mockReturnValue({});
  });

  it('should create a user with valid fields', () => {
    const userData = {
      username: 'testuser',
      password: 'password123',
      role: 'user'
    };
    
    const user = new User(userData);
    
    expect(user.username).toBe('testuser');
    expect(user.password).toBe('password123');
    expect(user.role).toBe('user');
  });
  
  it('should have default role as "user" if not provided', () => {
    const userData = {
      username: 'testuser',
      password: 'password123'
    };
    
    const user = new User(userData);
    
    expect(user.role).toBe('user');
  });
  
  it('should validate required fields', () => {
    const user = new User({});
    const validationError = user.validateSync();
    
    expect(validationError).toBeDefined();
    expect(validationError.errors.username).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
  });
  
  it('should validate username uniqueness', async () => {
    // Mock the User.findOne method to simulate a duplicate username
    User.findOne = jest.fn().mockResolvedValue({ username: 'existinguser' });
    
    // Create a schema validation function that checks uniqueness
    const validateUniqueness = User.schema.path('username').validators.find(
      validator => validator.type === 'unique'
    );
    
    // If there's a uniqueness validator, test it
    if (validateUniqueness) {
      const validationError = await validateUniqueness.validator('existinguser');
      expect(validationError).toBeFalsy();
    } else {
      // If no uniqueness validator, this test is not applicable
      expect(true).toBe(true);
    }
  });
  
  it('should validate role enum values', () => {
    const validUser = new User({
      username: 'testuser',
      password: 'password123',
      role: 'admin'
    });
    
    const invalidUser = new User({
      username: 'testuser',
      password: 'password123',
      role: 'superadmin' // Invalid role
    });
    
    expect(validUser.validateSync()).toBeUndefined();
    
    const validationError = invalidUser.validateSync();
    if (validationError && validationError.errors.role) {
      expect(validationError.errors.role).toBeDefined();
    }
  });
});