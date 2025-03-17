const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");

const processRecurringTransactions = async () => {
  try {
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      'recurringDetails.endDate': { $gte: new Date() }
    });

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    for (const transaction of recurringTransactions) {
      const { frequency, lastProcessed, startDate } = transaction.recurringDetails;
      let shouldProcess = false;
      let nextDueDate = new Date();

      // Calculate next due date and check if processing is needed
      switch (frequency) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          shouldProcess = !lastProcessed || (now - lastProcessed) >= 24 * 60 * 60 * 1000;
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          shouldProcess = !lastProcessed || (now - lastProcessed) >= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          shouldProcess = !lastProcessed || 
            (now.getMonth() > lastProcessed.getMonth() || 
             now.getFullYear() > lastProcessed.getFullYear());
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          shouldProcess = !lastProcessed || 
            now.getFullYear() > lastProcessed.getFullYear();
          break;
      }

      // Create notification for upcoming transaction
      if (nextDueDate <= threeDaysFromNow) {
        await Notification.create({
          user: transaction.user,
          transaction: transaction._id,
          type: 'upcoming',
          message: `Upcoming ${transaction.type}: ${transaction.description} for $${transaction.amount} due on ${nextDueDate.toLocaleDateString()}`,
          dueDate: nextDueDate
        });
      }

      // Check for missed transactions and create notification
      if (shouldProcess && lastProcessed && (now - lastProcessed) > 24 * 60 * 60 * 1000) {
        await Notification.create({
          user: transaction.user,
          transaction: transaction._id,
          type: 'missed',
          message: `Missed ${transaction.type}: ${transaction.description} for $${transaction.amount} was due on ${lastProcessed.toLocaleDateString()}`,
          dueDate: lastProcessed
        });
      }

      // Process the transaction if needed
      if (shouldProcess) {
        const newTransaction = new Transaction({
          user: transaction.user,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          tags: transaction.tags,
          date: new Date()
        });

        await newTransaction.save();
        transaction.recurringDetails.lastProcessed = now;
        transaction.recurringDetails.nextDueDate = nextDueDate;
        await transaction.save();
      }
    }
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
};

module.exports = { processRecurringTransactions };