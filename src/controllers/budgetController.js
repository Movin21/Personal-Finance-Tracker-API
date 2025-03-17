const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const { STATUS_CODES } = require("../constants/constants");
const {
  generateBudgetRecommendations,
} = require("../services/budgetRecommendationService");
const { get } = require("mongoose");

const createBudget = async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.user.id,
    });
    await budget.save();
    res.status(STATUS_CODES.CREATED).json(budget);
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(STATUS_CODES.OK).json(budgets);
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!budget) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Budget not found" });
    }
    res.status(STATUS_CODES.OK).json(budget);
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getBudgetAnalytics = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    const analytics = [];

    for (const budget of budgets) {
      let query = { user: req.user.id, type: "expense" };

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

      analytics.push({
        budget,
        totalSpent,
        percentageUsed,
        remaining: budget.amount - totalSpent,
        status:
          percentageUsed >= 100
            ? "exceeded"
            : percentageUsed >= budget.warningThreshold
            ? "warning"
            : "safe",
      });
    }

    res.status(STATUS_CODES.OK).json(analytics);
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const getBudgetRecommendations = async (req, res) => {
  try {
    const recommendations = await generateBudgetRecommendations(req.user.id);
    res.status(200).json({
      recommendations,
      message: "Budget recommendations based on your last 3 months of spending",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  getBudgetAnalytics,
  getBudgetRecommendations,
};
