const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");

const generateBudgetRecommendations = async (userId) => {
  try {
    // Get last 3 months of transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: threeMonthsAgo }
    });

    // Analyze spending by category
    const categorySpending = {};
    transactions.forEach(transaction => {
      if (!categorySpending[transaction.category]) {
        categorySpending[transaction.category] = [];
      }
      categorySpending[transaction.category].push({
        amount: transaction.amount,
        month: new Date(transaction.date).getMonth()
      });
    });

    // Calculate trends and recommendations
    const recommendations = [];
    const currentBudgets = await Budget.find({ user: userId });

    for (const [category, spending] of Object.entries(categorySpending)) {
      const monthlyAverages = {};
      spending.forEach(transaction => {
        if (!monthlyAverages[transaction.month]) {
          monthlyAverages[transaction.month] = 0;
        }
        monthlyAverages[transaction.month] += transaction.amount;
      });

      const averageSpending = Object.values(monthlyAverages).reduce((a, b) => a + b, 0) / 3;
      const currentBudget = currentBudgets.find(b => b.category === category);

      if (currentBudget) {
        if (averageSpending > currentBudget.amount * 1.2) {
          recommendations.push({
            category,
            type: 'increase',
            currentBudget: currentBudget.amount,
            recommendedBudget: Math.ceil(averageSpending * 1.1),
            reason: `Consistently exceeding budget by ${Math.round((averageSpending/currentBudget.amount - 1) * 100)}%`
          });
        } else if (averageSpending < currentBudget.amount * 0.7) {
          recommendations.push({
            category,
            type: 'decrease',
            currentBudget: currentBudget.amount,
            recommendedBudget: Math.ceil(averageSpending * 1.2),
            reason: 'Significant underspending, budget could be optimized'
          });
        }
      } else {
        recommendations.push({
          category,
          type: 'new',
          recommendedBudget: Math.ceil(averageSpending * 1.1),
          reason: 'No budget set for active spending category'
        });
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating budget recommendations:', error);
    throw error;
  }
};

module.exports = { generateBudgetRecommendations };