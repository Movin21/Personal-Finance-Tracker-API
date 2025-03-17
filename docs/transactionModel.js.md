# Transaction Model Documentation

## Overview

The `transactionModel.js` file defines the schema and methods for financial transactions in the Personal Finance Tracker System. It includes support for multi-currency transactions, allowing users to record transactions in different currencies and convert between them.

## Dependencies

```javascript
const mongoose = require("mongoose");
```

## Schema Definition

```javascript
const transactionSchema = new mongoose.Schema(
  {
    // Schema fields
  },
  { timestamps: true }
);
```

### Fields

#### Basic Transaction Information

- `user`: ObjectId reference to the User who owns this transaction (required)
- `type`: String indicating transaction type, either "income" or "expense" (required)
- `amount`: Number representing the transaction amount (required)
- `category`: String categorizing the transaction (required)
- `description`: String providing additional details about the transaction
- `date`: Date when the transaction occurred (defaults to current date)
- `tags`: Array of strings for additional categorization

#### Multi-Currency Support Fields

- `currency`: String representing the currency of the transaction (required, defaults to "USD")
- `originalAmount`: Number representing the amount in the original currency (if different from the transaction currency)
- `originalCurrency`: String representing the original currency code
- `exchangeRate`: Number representing the exchange rate used for conversion

#### Recurring Transaction Fields

- `isRecurring`: Boolean indicating if this is a recurring transaction (defaults to false)
- `recurringDetails`: Object containing details for recurring transactions
  - `frequency`: String enum ("daily", "weekly", "monthly", "yearly")
  - `startDate`: Date when the recurring series starts
  - `endDate`: Date when the recurring series ends
  - `lastProcessed`: Date when the transaction was last processed

## Methods

### convertAmount

```javascript
transactionSchema.methods.convertAmount = async function(toCurrency, date) {
  // Method implementation
};
```

**Description**: Converts the transaction amount to a different currency.

**Parameters**:

- `toCurrency`: Target currency code to convert to
- `date`: (Optional) Date to use for historical exchange rates (defaults to transaction date)

**Returns**: Promise resolving to the converted amount

**Process Flow**:

1. If the transaction currency is the same as the target currency, returns the original amount
2. Otherwise, uses the CurrencyRate model to convert the amount using appropriate exchange rates

**Example Usage**:

```javascript
// Convert a transaction amount to EUR
const eurAmount = await transaction.convertAmount('EUR');

// Convert using a specific historical date
const historicalAmount = await transaction.convertAmount('GBP', new Date('2023-01-15'));
```

## Multi-Currency Transaction Flow

### Creating a Transaction in Foreign Currency

1. User specifies the transaction amount in a foreign currency
2. The system captures both the original currency/amount and the converted amount in the user's preferred currency
3. Exchange rate information is stored for future reference

### Displaying Transactions in User's Preferred Currency

1. When retrieving transactions, the system can convert all amounts to the user's preferred currency
2. The `convertAmount` method is used to perform these conversions
3. Both original and converted amounts can be displayed to the user

### Currency Conversion Process

1. The system uses the CurrencyRate model to find the appropriate exchange rate
2. If converting between currencies where neither is the base currency (e.g., EUR to GBP when USD is base), a two-step conversion is performed
3. Historical rates can be used for accurate reporting of past transactions

## Usage Examples

### Creating a Multi-Currency Transaction

```javascript
// Creating a transaction in a foreign currency
const transaction = new Transaction({
  user: userId,
  type: 'expense',
  amount: 85, // Amount in EUR (after conversion)
  currency: 'EUR',
  originalAmount: 100, // Original amount in CHF
  originalCurrency: 'CHF',
  exchangeRate: 0.85, // Exchange rate from CHF to EUR
  category: 'Travel',
  description: 'Hotel in Switzerland',
  date: new Date('2023-06-15')
});

await transaction.save();
```

### Converting Transaction Amount

```javascript
// Get a transaction
const transaction = await Transaction.findById(transactionId);

// Convert to user's preferred currency
const amountInUSD = await transaction.convertAmount('USD');
console.log(`Amount in USD: ${amountInUSD}`);
```

### Filtering Transactions by Currency

```javascript
// Find all transactions in a specific currency
const euroTransactions = await Transaction.find({
  user: userId,
  currency: 'EUR'
});
```

## Integration with Currency Service

The Transaction model integrates with the Currency Service to provide accurate and up-to-date currency conversions. This integration ensures that:

1. Transactions can be recorded in any supported currency
2. Historical exchange rates are used for accurate reporting
3. Users can view their financial data in their preferred currency
4. Currency conversion calculations are consistent throughout the application