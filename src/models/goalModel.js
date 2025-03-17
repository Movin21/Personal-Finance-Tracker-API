const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "USD",
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    autoAllocate: {
      type: Boolean,
      default: false,
    },
    allocationPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // To track transactions related to this goal
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);

// Virtual property to calculate progress percentage
goalSchema.virtual("progressPercentage").get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Method to add a transaction to the goal
goalSchema.methods.addTransaction = async function (transactionId, amount) {
  this.transactions.push(transactionId);
  
  // Update current amount, ensuring it doesn't go below 0
  this.currentAmount = Math.max(this.currentAmount + amount, 0);
  
  // Update status based on current amount
  if (this.currentAmount >= this.targetAmount) {
    this.status = "completed";
  } else if (this.status === "completed" && this.currentAmount < this.targetAmount) {
    // If a withdrawal causes the goal to go back to incomplete
    this.status = "active";
  }
  
  return this.save();
};

// Method to calculate remaining amount needed to reach the goal
goalSchema.virtual("remainingAmount").get(function () {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Method to calculate days remaining until target date
goalSchema.virtual("daysRemaining").get(function () {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const timeDiff = targetDate.getTime() - today.getTime();
  return Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 0);
});

module.exports = mongoose.model("Goal", goalSchema);