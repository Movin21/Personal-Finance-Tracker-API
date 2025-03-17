const Transaction = require("../models/transactionModel");
const { STATUS_CODES } = require("../constants/constants");

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user.id,
    });
    await transaction.save();
    res.status(STATUS_CODES.CREATED).json(transaction);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const { type, category, tags, startDate, endDate } = req.query;
    let query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.status(STATUS_CODES.OK).json(transactions);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Transaction not found" });
    }
    res.status(STATUS_CODES.OK).json(transaction);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!transaction) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Transaction not found" });
    }
    res.status(STATUS_CODES.OK).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};