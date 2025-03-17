const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const Goal = require("../models/goalModel");
const Notification = require("../models/notificationModel");
const { STATUS_CODES } = require("../constants/constants");
const { generateSpendingTrends } = require("../services/reportingService");
const mongoose = require("mongoose");

/**
 * Get admin dashboard data
 * Provides system-wide overview for administrators
 */
const getAdminDashboard = async (req, res) => {
  try {
    // Verify the user is an admin
    if (req.user.role !== "admin") {
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Access denied" });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) } // First day of current month
    });

    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const transactionsThisMonth = await Transaction.countDocuments({
      date: { $gte: new Date(new Date().setDate(1)) }
    });

    // Get financial summaries
    const incomeStats = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: {
          _id: null,
          total: { $sum: "$amount" },
          average: { $avg: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const expenseStats = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: {
          _id: null,
          total: { $sum: "$amount" },
          average: { $avg: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top spending categories across all users
    const topCategories = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // Get recent system activity
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(10)
      .populate("user", "username");

    // Get active goals count
    const activeGoals = await Goal.countDocuments({ status: "active" });

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    res.status(STATUS_CODES.OK).json({
      userStats: {
        totalUsers,
        newUsersThisMonth,
      },
      activityStats: {
        totalTransactions,
        transactionsThisMonth,
        activeGoals,
        unreadNotifications
      },
      financialSummary: {
        income: incomeStats.length > 0 ? incomeStats[0] : { total: 0, average: 0, count: 0 },
        expenses: expenseStats.length > 0 ? expenseStats[0] : { total: 0, average: 0, count: 0 },
        topCategories
      },
      recentActivity: recentTransactions
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Get user dashboard data
 * Provides personalized financial overview for regular users
 */
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    // Get user's budget summary
    const budgets = await Budget.find({ user: userId });
    const budgetSummary = [];

    for (const budget of budgets) {
      let query = { user: userId, type: "expense" };

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

      budgetSummary.push({
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

    // Get user's goals progress
    const goals = await Goal.find({ user: userId }).sort({ targetDate: 1 });

    // Get user's spending trends for the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const filters = {
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
    
    const spendingTrends = await generateSpendingTrends(userId, filters);

    // Get user's unread notifications
    const notifications = await Notification.find({ 
      user: userId,
      isRead: false 
    }).sort({ createdAt: -1 }).limit(5);

    // Calculate income vs expense for current month
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthIncome = await Transaction.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          type: "income",
          date: { $gte: currentMonthStart }
        } 
      },
      { 
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const currentMonthExpenses = await Transaction.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: currentMonthStart }
        } 
      },
      { 
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.status(STATUS_CODES.OK).json({
      recentTransactions,
      budgetSummary,
      goals,
      spendingTrends,
      notifications,
      monthlyFinancials: {
        income: currentMonthIncome.length > 0 ? currentMonthIncome[0].total : 0,
        expenses: currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0,
        balance: (currentMonthIncome.length > 0 ? currentMonthIncome[0].total : 0) - 
                 (currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0)
      }
    });
  } catch (error) {
    console.error("User dashboard error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getUserDashboard
};