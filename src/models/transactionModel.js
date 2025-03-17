const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "USD",
    },
    originalAmount: {
      type: Number,
    },
    originalCurrency: {
      type: String,
      uppercase: true,
      trim: true,
    },
    exchangeRate: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      default: Date.now,
    },
    tags: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      startDate: Date,
      endDate: Date,
      lastProcessed: Date,
    },
  },
  { timestamps: true }
);

// Method to convert transaction amount to a different currency
transactionSchema.methods.convertAmount = async function(toCurrency, date) {
  if (this.currency === toCurrency) return this.amount;
  
  const CurrencyRate = mongoose.model("CurrencyRate");
  return await CurrencyRate.convert(this.amount, this.currency, toCurrency, date || this.date);
};

module.exports = mongoose.model("Transaction", transactionSchema);
