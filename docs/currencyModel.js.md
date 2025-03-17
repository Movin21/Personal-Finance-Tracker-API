# Currency Model Documentation

## Overview

The `currencyModel.js` file defines the schema and methods for storing and managing currency exchange rates in the Personal Finance Tracker System. It provides functionality for retrieving exchange rates between currencies and converting amounts from one currency to another.

## Dependencies

```javascript
const mongoose = require("mongoose");
```

## Schema Definition

```javascript
const currencyRateSchema = new mongoose.Schema(
  {
    base: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    rates: {
      type: Map,
      of: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);
```

### Fields

- `base`: String representing the base currency code (e.g., "USD") for the exchange rates
- `rates`: Map of currency codes to exchange rates relative to the base currency
- `date`: Date when these exchange rates were valid/fetched
- `timestamps`: Automatically adds `createdAt` and `updatedAt` fields

## Static Methods

### getExchangeRate

```javascript
currencyRateSchema.statics.getExchangeRate = async function (fromCurrency, toCurrency, date = new Date()) {
  // Method implementation
};
```

**Description**: Retrieves the exchange rate between two currencies for a specific date.

**Parameters**:

- `fromCurrency`: Source currency code
- `toCurrency`: Target currency code
- `date`: (Optional) Date for historical exchange rates (defaults to current date)

**Returns**: Promise resolving to the exchange rate (number)

**Process Flow**:

1. If source and target currencies are the same, returns 1
2. Finds the closest rate entry to the given date
3. Calculates the exchange rate based on the relationship between the currencies:
   - If source currency is the base currency, returns the direct rate
   - If target currency is the base currency, returns the inverse rate
   - If neither currency is the base, converts through the base currency

**Error Handling**:

- Throws an error if no exchange rates are available
- Throws an error if exchange rate for a specific currency is not available

### convert

```javascript
currencyRateSchema.statics.convert = async function (amount, fromCurrency, toCurrency, date = new Date()) {
  // Method implementation
};
```

**Description**: Converts an amount from one currency to another using the appropriate exchange rate.

**Parameters**:

- `amount`: Number representing the amount to convert
- `fromCurrency`: Source currency code
- `toCurrency`: Target currency code
- `date`: (Optional) Date for historical conversion (defaults to current date)

**Returns**: Promise resolving to the converted amount

**Process Flow**:

1. Gets the exchange rate using the `getExchangeRate` method
2. Multiplies the amount by the exchange rate

## Exchange Rate Calculation Logic

### Direct Conversion

When converting between currencies where one is the base currency:

```javascript
// If fromCurrency is the base currency (e.g., USD to EUR)
rate = rateEntry.rates.get(toCurrency);
convertedAmount = amount * rate;

// If toCurrency is the base currency (e.g., EUR to USD)
rate = 1 / rateEntry.rates.get(fromCurrency);
convertedAmount = amount * rate;
```

### Cross-Currency Conversion

When converting between currencies where neither is the base currency (e.g., EUR to GBP with USD as base):

```javascript
// Get rates for both currencies relative to the base
const fromRate = rateEntry.rates.get(fromCurrency); // EUR to USD
const toRate = rateEntry.rates.get(toCurrency);     // GBP to USD

// Calculate cross-rate
rate = toRate / fromRate;
convertedAmount = amount * rate;
```

## Usage Examples

### Getting an Exchange Rate

```javascript
// Get current exchange rate from USD to EUR
const rate = await CurrencyRate.getExchangeRate('USD', 'EUR');
console.log(`1 USD = ${rate} EUR`);

// Get historical exchange rate
const historicalRate = await CurrencyRate.getExchangeRate(
  'USD', 
  'JPY', 
  new Date('2023-01-15')
);
console.log(`1 USD = ${historicalRate} JPY on Jan 15, 2023`);
```

### Converting Currency Amounts

```javascript
// Convert 100 USD to EUR
const eurAmount = await CurrencyRate.convert(100, 'USD', 'EUR');
console.log(`100 USD = ${eurAmount} EUR`);

// Convert 50 GBP to CAD using historical rates
const cadAmount = await CurrencyRate.convert(
  50, 
  'GBP', 
  'CAD', 
  new Date('2023-03-20')
);
console.log(`50 GBP = ${cadAmount} CAD on Mar 20, 2023`);
```

## Integration with Currency Service

The CurrencyRate model is used by the Currency Service to:

1. Store exchange rates fetched from external APIs
2. Provide exchange rate data for currency conversions throughout the application
3. Support historical exchange rate lookups for accurate financial reporting
4. Enable multi-currency support for transactions, budgets, and goals