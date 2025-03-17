const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/dbConnection");
const authRoutes = require("./src/routes/authRoute");
const userRoutes = require("./src/routes/userRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const budgetRoutes = require("./src/routes/budgetRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const goalRoutes = require("./src/routes/goalRoutes");
const currencyRoutes = require("./src/routes/currencyRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const schedule = require("node-schedule");
const {
  processRecurringTransactions,
} = require("./src/services/recurringTransactionService");
const { monitorBudgets } = require("./src/services/budgetNotificationService");
const CurrencyService = require('./src/services/currencyService');

// Schedule budget monitoring (runs every 6 hours)
schedule.scheduleJob("0 */6 * * *", monitorBudgets);

// Schedule recurring transactions check (runs daily at midnight)
schedule.scheduleJob("0 0 * * *", processRecurringTransactions);

dotenv.config();
connectDB().then(async () => {
  try {
    await CurrencyService.initialize();
    console.log("Currency service initialized");
  } catch (error) {
    console.error("Error initializing currency service:", error.message);
  }
});

const app = express();
app.use(cors());

//middleware
app.use(bodyParser.json());
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/currency", currencyRoutes);
app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
