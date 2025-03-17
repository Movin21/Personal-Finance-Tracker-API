const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");

const checkBudgets = async () => {
  try {
    const budgets = await Budget.find({});

    for (const budget of budgets) {
      let query = { user: budget.user, type: "expense" };
      
      if (budget.type === "monthly") {
        const startDate = new Date(budget.month);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        query.date = { $gte: startDate, $lt: endDate };
      } else if (budget.type === "category") {
        query.category = budget.category;
      }

      const transactions = await Transaction.find(query);
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const percentageUsed = (totalSpent / budget.amount) * 100;

      // Create notifications for budget warnings
      if (percentageUsed >= 100 && budget.currentSpending < budget.amount) {
        await Notification.create({
          user: budget.user,
          type: 'budget_exceeded',
          message: `Budget exceeded for ${budget.type === 'monthly' ? 'monthly' : budget.category} budget: Spent $${totalSpent} of $${budget.amount}`,
        });
      } else if (percentageUsed >= budget.warningThreshold && totalSpent > budget.currentSpending) {
        await Notification.create({
          user: budget.user,
          type: 'budget_warning',
          message: `Approaching budget limit for ${budget.type === 'monthly' ? 'monthly' : budget.category} budget: ${percentageUsed.toFixed(1)}% used`,
        });
      }

      // Update current spending
      budget.currentSpending = totalSpent;
      await budget.save();
    }
  } catch (error) {
    console.error('Error checking budgets:', error);
  }
};

module.exports = { checkBudgets };