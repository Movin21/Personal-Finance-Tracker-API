# Server.js Documentation

## Overview

The `server.js` file is the main entry point for the Personal Finance Tracker System. It initializes the Express application, connects to the database, sets up middleware, defines routes, and configures scheduled tasks.

## Dependencies

```javascript
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
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const schedule = require("node-schedule");
const {
  processRecurringTransactions,
} = require("./src/services/recurringTransactionService");
const { monitorBudgets } = require("./src/services/budgetNotificationService");
```

## Scheduled Tasks

### Budget Monitoring

```javascript
schedule.scheduleJob("0 */6 * * *", monitorBudgets);
```

**Description**: Monitors user budgets and sends notifications when spending approaches or exceeds budget thresholds.

**Schedule**: Runs every 6 hours (at 0:00, 6:00, 12:00, and 18:00)

**Function**: `monitorBudgets` from `budgetNotificationService.js`

### Recurring Transactions Processing

```javascript
schedule.scheduleJob("0 0 * * *", processRecurringTransactions);
```

**Description**: Processes recurring transactions and creates notifications for upcoming transactions.

**Schedule**: Runs daily at midnight (0:00)

**Function**: `processRecurringTransactions` from `recurringTransactionService.js`

## Application Configuration

```javascript
dotenv.config();
connectDB();

const app = express();
app.use(cors());
```

**Description**:
- Loads environment variables from `.env` file
- Connects to MongoDB database using the connection function from `dbConnection.js`
- Creates Express application instance
- Enables CORS (Cross-Origin Resource Sharing) for all routes

## Middleware Configuration

```javascript
app.use(bodyParser.json());
app.use(express.json());
```

**Description**:
- `bodyParser.json()`: Parses incoming request bodies in JSON format
- `express.json()`: Built-in middleware that parses incoming requests with JSON payloads

## Route Configuration

```javascript
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
```

**Description**:
- `/api/auth`: Authentication routes (register, login)
- `/api/users`: User management routes
- `/api/transactions`: Transaction management routes
- `/api/budgets`: Budget management routes
- `/api/notifications`: Notification management routes
- `/api/reports`: Financial reporting routes
- `notFound`: Middleware that handles requests to undefined routes

## Error Handling

```javascript
app.use(errorHandler);
```

**Description**: Global error handling middleware that processes errors and sends appropriate responses.

## Server Initialization

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Description**:
- Sets the server port from environment variables or defaults to 5000
- Starts the Express server and listens for incoming connections
- Logs a message when the server is successfully started