const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");

const monitorBudgets = async () => {
  try {
    const budgets = await Budget.find({}).populate('user');

    for (const budget of budgets) {
      // Calculate total spending
      const query = {
        user: budget.user._id,
        type: "expense",
        ...(budget.type === "category" && { category: budget.category }),
        ...(budget.type === "monthly" && {
          date: {
            $gte: new Date(budget.month),
            $lt: new Date(new Date(budget.month).setMonth(new Date(budget.month).getMonth() + 1))
          }
        })
      };

      const transactions = await Transaction.find(query);
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const spendingPercentage = (totalSpent / budget.amount) * 100;

      // Check if we need to send notifications
      if (spendingPercentage >= 100 && budget.currentSpending < budget.amount) {
        await Notification.create({
          user: budget.user._id,
          type: 'budget_exceeded',
          message: `Alert: Budget Exceeded! You've spent $${totalSpent.toFixed(2)} of your $${budget.amount.toFixed(2)} ${budget.type === 'monthly' ? 'monthly' : budget.category} budget.`,
          severity: 'high'
        });
      } else if (spendingPercentage >= budget.warningThreshold && spendingPercentage < 100) {
        await Notification.create({
          user: budget.user._id,
          type: 'budget_warning',
          message: `Warning: You've used ${spendingPercentage.toFixed(1)}% of your ${budget.type === 'monthly' ? 'monthly' : budget.category} budget. ($${totalSpent.toFixed(2)} of $${budget.amount.toFixed(2)})`,
          severity: 'medium'
        });
      }

      // Update current spending
      budget.currentSpending = totalSpent;
      await budget.save();
    }
  } catch (error) {
    console.error('Budget monitoring error:', error);
  }
};

module.exports = { monitorBudgets };