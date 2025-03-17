# Budget Notification Service Documentation

## Overview

The `budgetNotificationService.js` file contains functionality for monitoring user budgets and sending notifications when spending approaches or exceeds budget thresholds. This service is a critical component of the Personal Finance Tracker System's budget management features.

## Dependencies

```javascript
const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
```

## Functions

### monitorBudgets

```javascript
const monitorBudgets = async () => {
  // Function implementation
};
```

**Description**: This function is scheduled to run every 6 hours. It monitors all user budgets, calculates current spending, and sends notifications when spending approaches or exceeds budget thresholds.

**Process Flow**:

1. **Retrieve All Budgets**:
   - Fetches all budget records from the database with populated user information

2. **Calculate Spending for Each Budget**:
   - For each budget, constructs a query to find relevant expense transactions
   - For monthly budgets, filters transactions within the budget month
   - For category budgets, filters transactions by category

3. **Evaluate Budget Status**:
   - Calculates total spending for the budget period or category
   - Computes spending as a percentage of the budget amount

4. **Create Notifications**:
   - If spending exceeds 100% of budget, creates a "budget_exceeded" notification
   - If spending exceeds the warning threshold (default 80%) but is less than 100%, creates a "budget_warning" notification

5. **Update Budget Records**:
   - Updates the `currentSpending` field for each budget to reflect the latest total

**Notification Types**:

- **Budget Exceeded**: High severity notification when spending exceeds the budget amount
- **Budget Warning**: Medium severity notification when spending approaches the budget limit

**Error Handling**:
- Catches and logs any errors that occur during the monitoring process

## Usage

This service is automatically scheduled in `server.js` to run every 6 hours:

```javascript
schedule.scheduleJob("0 */6 * * *", monitorBudgets);
```

## Integration Points

- **Budget Model**: Reads and updates budget records
- **Transaction Model**: Queries expense transactions for spending calculations
- **Notification Model**: Creates notifications for budget warnings and alerts
- **Server.js**: Scheduled task configuration