# Currency Controller Documentation

## Overview

The `currencyController.js` file provides functionality for managing currency-related operations in the Personal Finance Tracker System. It handles exchange rate retrieval, currency conversion, and user currency preferences, enabling multi-currency support throughout the application.

## Dependencies

```javascript
const CurrencyService = require('../services/currencyService');
const User = require('../models/userModel');
const { STATUS_CODES } = require('../constants/constants');
```

## Functions

### getExchangeRates

```javascript
const getExchangeRates = async (req, res) => {
  // Function implementation
};
```

**Description**: Retrieves the latest exchange rates for a specified base currency.

**Route**: `GET /api/currency/rates/:baseCurrency`

**Access**: Public

**Parameters**:

- `req`: Express request object
  - `params.baseCurrency`: (Optional) Base currency code (defaults to 'USD')
- `res`: Express response object

**Process Flow**:

1. Extracts the base currency from request parameters (defaults to 'USD')
2. Retrieves latest exchange rates using the CurrencyService
3. Returns the rates with a 200 OK status

**Error Handling**:

- Catches and returns any errors with a 500 status code

**Response**:

- Success: 200 OK with exchange rates object
- Error: 500 Internal Server Error with error message

**Example Response**:

```json
{
  "_id": "60f1a5b3e6b3f32d8cde4567",
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.72,
    "JPY": 110.42,
    "CAD": 1.25
  },
  "date": "2023-07-15T10:30:00.000Z",
  "createdAt": "2023-07-15T10:30:00.000Z",
  "updatedAt": "2023-07-15T10:30:00.000Z"
}
```

### convertCurrency

```javascript
const convertCurrency = async (req, res) => {
  // Function implementation
};
```

**Description**: Converts an amount from one currency to another using current or historical exchange rates.

**Route**: `POST /api/currency/convert`

**Access**: Public

**Parameters**:

- `req`: Express request object
  - `body.amount`: Amount to convert
  - `body.fromCurrency`: Source currency code
  - `body.toCurrency`: Target currency code
  - `body.date`: (Optional) Date for historical conversion
- `res`: Express response object

**Process Flow**:

1. Validates required parameters (amount, fromCurrency, toCurrency)
2. Converts the amount using CurrencyService
3. Returns the conversion result with a 200 OK status

**Error Handling**:

- Missing parameters: 400 Bad Request
- Conversion errors: 500 Internal Server Error

**Response**:

- Success: 200 OK with conversion details
- Missing parameters: 400 Bad Request
- Error: 500 Internal Server Error with error message

**Example Request**:

```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "date": "2023-07-15"
}
```

**Example Response**:

```json
{
  "originalAmount": 100,
  "originalCurrency": "USD",
  "convertedAmount": 85,
  "targetCurrency": "EUR",
  "exchangeRate": 0.85,
  "date": "2023-07-15T00:00:00.000Z"
}
```

### updatePreferredCurrency

```javascript
const updatePreferredCurrency = async (req, res) => {
  // Function implementation
};
```

**Description**: Updates the authenticated user's preferred currency setting.

**Route**: `PUT /api/currency/preference`

**Access**: Private (requires authentication)

**Parameters**:

- `req`: Express request object
  - `body.preferredCurrency`: Currency code to set as preferred
  - `user.id`: User ID (added by authentication middleware)
- `res`: Express response object

**Process Flow**:

1. Validates that preferredCurrency is provided
2. Updates the user's preferredCurrency field in the database
3. Returns success message with the updated preference

**Error Handling**:

- Missing preferredCurrency: 400 Bad Request
- User not found: 404 Not Found
- Other errors: 500 Internal Server Error

**Response**:

- Success: 200 OK with success message and updated preference
- Missing parameter: 400 Bad Request
- User not found: 404 Not Found
- Error: 500 Internal Server Error with error message

**Example Request**:

```json
{
  "preferredCurrency": "EUR"
}
```

**Example Response**:

```json
{
  "message": "Preferred currency updated successfully",
  "preferredCurrency": "EUR"
}
```

### getPreferredCurrency

```javascript
const getPreferredCurrency = async (req, res) => {
  // Function implementation
};
```

**Description**: Retrieves the authenticated user's preferred currency setting.

**Route**: `GET /api/currency/preference`

**Access**: Private (requires authentication)

**Parameters**:

- `req`: Express request object
  - `user.id`: User ID (added by authentication middleware)
- `res`: Express response object

**Process Flow**:

1. Retrieves the user from the database
2. Returns the user's preferred currency

**Error Handling**:

- User not found: 404 Not Found
- Other errors: 500 Internal Server Error

**Response**:

- Success: 200 OK with preferred currency
- User not found: 404 Not Found
- Error: 500 Internal Server Error with error message

**Example Response**:

```json
{
  "preferredCurrency": "USD"
}
```

### refreshExchangeRates

```javascript
const refreshExchangeRates = async (req, res) => {
  // Function implementation
};
```

**Description**: Forces a refresh of exchange rates from the external API.

**Route**: `POST /api/currency/refresh/:baseCurrency`

**Access**: Admin only

**Parameters**:

- `req`: Express request object
  - `params.baseCurrency`: (Optional) Base currency code (defaults to 'USD')
- `res`: Express response object

**Process Flow**:

1. Extracts the base currency from request parameters (defaults to 'USD')
2. Fetches and stores fresh exchange rates using CurrencyService
3. Returns success message with the updated rates

**Error Handling**:

- Catches and returns any errors with a 500 status code

**Response**:

- Success: 200 OK with success message and updated rates
- Error: 500 Internal Server Error with error message

**Example Response**:

```json
{
  "message": "Exchange rates refreshed successfully",
  "rates": {
    "_id": "60f1a5b3e6b3f32d8cde4567",
    "base": "USD",
    "rates": {
      "EUR": 0.85,
      "GBP": 0.72,
      "JPY": 110.42,
      "CAD": 1.25
    },
    "date": "2023-07-15T10:30:00.000Z",
    "createdAt": "2023-07-15T10:30:00.000Z",
    "updatedAt": "2023-07-15T10:30:00.000Z"
  }
}
```

## Usage

The Currency Controller provides essential functionality for multi-currency support in the application:

1. **Exchange Rate Retrieval**: Get current exchange rates for currency conversion
2. **Currency Conversion**: Convert amounts between different currencies
3. **User Preferences**: Set and retrieve user's preferred currency
4. **Rate Management**: Admin functionality to refresh exchange rates

These endpoints enable the application to handle transactions in multiple currencies, display amounts in the user's preferred currency, and maintain up-to-date exchange rates for accurate financial tracking.