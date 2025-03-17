const Transaction = require("../models/transactionModel");

const generateSpendingTrends = async (userId, filters) => {
  try {
    const { startDate, endDate, category, tags } = filters;
    let query = { user: userId };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) query.category = category;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    const transactions = await Transaction.find(query).sort({ date: 1 });

    // Group by month and type (income/expense)
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0, categories: {}, tags: {} };
      }

      if (transaction.type === 'income') {
        acc[monthKey].income += transaction.amount;
      } else {
        acc[monthKey].expenses += transaction.amount;
        
        // Category tracking
        if (!acc[monthKey].categories[transaction.category]) {
          acc[monthKey].categories[transaction.category] = 0;
        }
        acc[monthKey].categories[transaction.category] += transaction.amount;

        // Tag tracking
        transaction.tags?.forEach(tag => {
          if (!acc[monthKey].tags[tag]) {
            acc[monthKey].tags[tag] = 0;
          }
          acc[monthKey].tags[tag] += transaction.amount;
        });
      }

      return acc;
    }, {});

    return {
      monthlyData,
      summary: generateSummary(monthlyData),
      trends: analyzeTrends(monthlyData)
    };
  } catch (error) {
    throw error;
  }
};

const generateSummary = (monthlyData) => {
  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    averageMonthlyIncome: 0,
    averageMonthlyExpenses: 0,
    monthsAnalyzed: Object.keys(monthlyData).length
  };

  Object.values(monthlyData).forEach(month => {
    summary.totalIncome += month.income;
    summary.totalExpenses += month.expenses;
  });

  summary.netSavings = summary.totalIncome - summary.totalExpenses;
  summary.averageMonthlyIncome = summary.totalIncome / summary.monthsAnalyzed;
  summary.averageMonthlyExpenses = summary.totalExpenses / summary.monthsAnalyzed;

  return summary;
};

const analyzeTrends = (monthlyData) => {
  const months = Object.keys(monthlyData).sort();
  const trends = {
    incomeGrowth: [],
    expenseGrowth: [],
    topCategories: {},
    topTags: {}
  };

  // Calculate month-over-month growth
  for (let i = 1; i < months.length; i++) {
    const currentMonth = monthlyData[months[i]];
    const previousMonth = monthlyData[months[i-1]];

    trends.incomeGrowth.push({
      month: months[i],
      growth: ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
    });

    trends.expenseGrowth.push({
      month: months[i],
      growth: ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
    });
  }

  return trends;
};

module.exports = {
  generateSpendingTrends
};