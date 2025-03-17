# Recurring Transaction Service Documentation

## Overview

The `recurringTransactionService.js` file contains functionality for managing recurring transactions in the Personal Finance Tracker System. It processes recurring transactions based on their frequency and creates notifications for upcoming transactions.

## Dependencies

```javascript
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
```

## Functions

### processRecurringTransactions

```javascript
const processRecurringTransactions = async () => {
  // Function implementation
};
```

**Description**: This function is scheduled to run daily at midnight. It processes all active recurring transactions and creates notifications for upcoming transactions.

**Process Flow**:

1. **Find Active Recurring Transactions**:
   - Retrieves all transactions where `isRecurring` is true and the end date is in the future

2. **Process Each Transaction**:
   - For each recurring transaction, calculates the next due date based on its frequency (daily, weekly, monthly, yearly)
   - Determines if the transaction needs processing based on when it was last processed

3. **Create Notifications**:
   - Creates notifications for transactions due within the next 3 days
   - Notification includes transaction details and due date

4. **Update Transaction Records**:
   - Updates the `lastProcessed` date for each processed transaction

**Frequency Handling**:

- **Daily**: Processes if last processed more than 24 hours ago
- **Weekly**: Processes if last processed more than 7 days ago
- **Monthly**: Processes if the current month is different from the last processed month
- **Yearly**: Processes if the current year is different from the last processed year

**Error Handling**:
- Catches and logs any errors that occur during processing

## Usage

This service is automatically scheduled in `server.js` to run daily at midnight:

```javascript
schedule.scheduleJob("0 0 * * *", processRecurringTransactions);
```

## Integration Points

- **Transaction Model**: Reads and updates recurring transaction records
- **Notification Model**: Creates notifications for upcoming transactions
- **Server.js**: Scheduled task configuration