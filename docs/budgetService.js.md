# Budget Service Documentation

## Overview

The `budgetService.js` file contains functionality for checking and monitoring user budgets in the Personal Finance Tracker System. It calculates current spending against budget limits and creates notifications when thresholds are reached.

## Dependencies

```javascript
const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
```

## Functions

### checkBudgets

```javascript
const checkBudgets = async () => {
  // Function implementation
};
```

**Description**: This function checks all user budgets, calculates current spending, and creates notifications when spending approaches or exceeds budget thresholds.

**Process Flow**:

1. **Retrieve All Budgets**:
   - Fetches all budget records from the database

2. **Process Each Budget**:
   - For each budget, constructs a query to find relevant expense transactions
   - For monthly budgets, filters transactions within the budget month
   - For category budgets, filters transactions by category

3. **Calculate Spending**:
   - Retrieves all expense transactions matching the query
   - Calculates total spending by summing transaction amounts
   - Computes percentage of budget used

4. **Create Notifications**:
   - If spending exceeds 100% of budget and current spending was previously below budget, creates a "budget_exceeded" notification
   - If spending exceeds the warning threshold (default 80%) but is less than 100%, and spending has increased, creates a "budget_warning" notification

5. **Update Budget Records**:
   - Updates the `currentSpending` field for each budget to reflect the latest total
   - Saves the updated budget record

**Notification Messages**:

- **Budget Exceeded**: Notifies when spending has gone over the budget amount
- **Budget Warning**: Notifies when spending is approaching the budget limit based on the warning threshold

**Error Handling**:
- Catches and logs any errors that occur during the budget checking process

## Usage

This service can be called from other parts of the application to check budget status:

```javascript
const { checkBudgets } = require("../services/budgetService");

// Call the function to check budgets
await checkBudgets();
```

## Integration Points

- **Budget Model**: Reads and updates budget records
- **Transaction Model**: Queries expense transactions for spending calculations
- **Notification Model**: Creates notifications for budget warnings and alerts