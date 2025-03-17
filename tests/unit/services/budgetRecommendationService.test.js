const { generateBudgetRecommendations } = require('../../../src/services/budgetRecommendationService');
const Transaction = require('../../../src/models/transactionModel');
const Budget = require('../../../src/models/budgetModel');

// Mock dependencies
jest.mock('../../../src/models/transactionModel');
jest.mock('../../../src/models/budgetModel');

describe('Budget Recommendation Service', () => {
  let mockUserId;
  let mockTransactions;
  let mockBudgets;
  let fixedDate;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    mockUserId = 'user123';
    
    // Create a fixed date for testing
    fixedDate = new Date('2023-06-15');
    
    // Create mock transactions for the last 3 months
    mockTransactions = [
      // Food category
      {
        _id: 'trans1',
        user: mockUserId,
        category: 'Food',
        amount: 300,
        date: new Date('2023-05-10')
      },
      {
        _id: 'trans2',
        user: mockUserId,
        category: 'Food',
        amount: 350,
        date: new Date('2023-04-15')
      },
      {
        _id: 'trans3',
        user: mockUserId,
        category: 'Food',
        amount: 400,
        date: new Date('2023-03-20')
      },
      
      // Entertainment category
      {
        _id: 'trans4',
        user: mockUserId,
        category: 'Entertainment',
        amount: 100,
        date: new Date('2023-05-05')
      },
      {
        _id: 'trans5',
        user: mockUserId,
        category: 'Entertainment',
        amount: 120,
        date: new Date('2023-04-10')
      },
      
      // Transportation category (no budget yet)
      {
        _id: 'trans6',
        user: mockUserId,
        category: 'Transportation',
        amount: 200,
        date: new Date('2023-05-20')
      },
      {
        _id: 'trans7',
        user: mockUserId,
        category: 'Transportation',
        amount: 180,
        date: new Date('2023-04-25')
      },
      {
        _id: 'trans8',
        user: mockUserId,
        category: 'Transportation',
        amount: 220,
        date: new Date('2023-03-30')
      }
    ];
    
    // Create mock budgets
    mockBudgets = [
      {
        _id: 'budget1',
        user: mockUserId,
        category: 'Food',
        amount: 250, // Less than average spending
        type: 'category'
      },
      {
        _id: 'budget2',
        user: mockUserId,
        category: 'Entertainment',
        amount: 200, // More than average spending
        type: 'category'
      }
      // No budget for Transportation
    ];
    
    // Mock Date.now to return our fixed date
    jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime());
    
    // Mock the setMonth method to work with our test
    const originalSetMonth = Date.prototype.setMonth;
    jest.spyOn(Date.prototype, 'setMonth').mockImplementation(function(month) {
      const newDate = new Date(this);
      return originalSetMonth.call(newDate, month);
    });
    
    // Mock Transaction.find
    Transaction.find = jest.fn().mockResolvedValue(mockTransactions);
    
    // Mock Budget.find
    Budget.find = jest.fn().mockResolvedValue(mockBudgets);
  });
  
  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });
  
  it('should recommend increasing budget for categories consistently exceeding budget', async () => {
    const recommendations = await generateBudgetRecommendations(mockUserId);
    
    // Check that Transaction.find was called with correct parameters
    expect(Transaction.find).toHaveBeenCalledWith({
      user: mockUserId,
      date: { $gte: expect.any(Date) }
    });
    
    // Check that Budget.find was called with correct parameters
    expect(Budget.find).toHaveBeenCalledWith({ user: mockUserId });
    
    // Find the recommendation for Food category
    const foodRecommendation = recommendations.find(r => r.category === 'Food');
    
    // Verify recommendation properties
    expect(foodRecommendation).toBeDefined();
    expect(foodRecommendation.type).toBe('increase');
    expect(foodRecommendation.currentBudget).toBe(250);
    expect(foodRecommendation.recommendedBudget).toBeGreaterThan(foodRecommendation.currentBudget);
    expect(foodRecommendation.reason).toContain('Consistently exceeding budget');
  });
  
  it('should recommend decreasing budget for categories significantly underspending', async () => {
    const recommendations = await generateBudgetRecommendations(mockUserId);
    
    // Find the recommendation for Entertainment category
    const entertainmentRecommendation = recommendations.find(r => r.category === 'Entertainment');
    
    // Verify recommendation properties
    expect(entertainmentRecommendation).toBeDefined();
    expect(entertainmentRecommendation.type).toBe('decrease');
    expect(entertainmentRecommendation.currentBudget).toBe(200);
    expect(entertainmentRecommendation.recommendedBudget).toBeLessThan(entertainmentRecommendation.currentBudget);
    expect(entertainmentRecommendation.reason).toContain('Significant underspending');
  });
  
  it('should recommend new budgets for categories without existing budgets', async () => {
    const recommendations = await generateBudgetRecommendations(mockUserId);
    
    // Find the recommendation for Transportation category
    const transportationRecommendation = recommendations.find(r => r.category === 'Transportation');
    
    // Verify recommendation properties
    expect(transportationRecommendation).toBeDefined();
    expect(transportationRecommendation.type).toBe('new');
    expect(transportationRecommendation.currentBudget).toBeUndefined();
    expect(transportationRecommendation.recommendedBudget).toBeGreaterThan(0);
    expect(transportationRecommendation.reason).toContain('No budget set');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock Transaction.find to throw an error
    const mockError = new Error('Database error');
    Transaction.find = jest.fn().mockRejectedValue(mockError);
    
    // Mock console.error to prevent actual console output during test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Expect the function to throw the error
    await expect(generateBudgetRecommendations(mockUserId)).rejects.toThrow('Database error');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Error generating budget recommendations:',
      mockError
    );
  });
  
  it('should handle empty transaction data', async () => {
    // Mock empty transactions
    Transaction.find = jest.fn().mockResolvedValue([]);
    
    const recommendations = await generateBudgetRecommendations(mockUserId);
    
    // Should return empty recommendations array
    expect(recommendations).toEqual([]);
  });
});