const Goal = require("../models/goalModel");
const Transaction = require("../models/transactionModel");
const { STATUS_CODES } = require("../constants/constants");

// Create a new financial goal
const createGoal = async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user.id,
    });
    await goal.save();
    res.status(STATUS_CODES.CREATED).json(goal);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get all goals for a user
const getGoals = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = { user: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.status(STATUS_CODES.OK).json(goals);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get a specific goal by ID
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id })
      .populate("transactions");
    
    if (!goal) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Goal not found" });
    }
    
    res.status(STATUS_CODES.OK).json(goal);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!goal) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Goal not found" });
    }
    
    res.status(STATUS_CODES.OK).json(goal);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!goal) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Goal not found" });
    }
    
    res.status(STATUS_CODES.OK).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Add a manual contribution to a goal
const addContribution = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Goal not found" });
    }
    
    // Create a transaction for this contribution
    const transaction = new Transaction({
      user: req.user.id,
      type: "expense",
      amount,
      category: "Savings",
      description: description || `Contribution to ${goal.title}`,
      date: new Date(),
      tags: ["goal", goal.category],
    });
    
    await transaction.save();
    
    // Add transaction to goal and update current amount
    await goal.addTransaction(transaction._id, amount);
    
    res.status(STATUS_CODES.OK).json(goal);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Automatically allocate a percentage of an income transaction to goals
const allocateIncomeToGoals = async (userId, transaction) => {
  try {
    // Only process income transactions
    if (transaction.type !== "income") return;
    
    // Find all active goals with autoAllocate enabled
    const goals = await Goal.find({
      user: userId,
      status: "active",
      autoAllocate: true,
    });
    
    if (goals.length === 0) return;
    
    // Calculate and allocate amounts to each goal
    for (const goal of goals) {
      const allocationAmount = (transaction.amount * goal.allocationPercentage) / 100;
      
      if (allocationAmount > 0) {
        // Create a transaction for this allocation
        const allocationTransaction = new Transaction({
          user: userId,
          type: "expense",
          amount: allocationAmount,
          category: "Savings",
          description: `Automatic allocation to ${goal.title} (${goal.allocationPercentage}% of income)`,
          date: new Date(),
          tags: ["goal", "automatic", goal.category],
        });
        
        await allocationTransaction.save();
        
        // Add transaction to goal and update current amount
        await goal.addTransaction(allocationTransaction._id, allocationAmount);
      }
    }
  } catch (error) {
    console.error("Error allocating income to goals:", error);
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  allocateIncomeToGoals,
};