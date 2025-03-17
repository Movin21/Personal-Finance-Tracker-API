const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["monthly", "category"],
      required: true,
    },
    category: {
      type: String,
      required: function() {
        return this.type === "category";
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Date,
      required: function() {
        return this.type === "monthly";
      },
    },
    currentSpending: {
      type: Number,
      default: 0,
    },
    warningThreshold: {
      type: Number,
      default: 80, // Percentage
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);