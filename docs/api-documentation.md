# Personal Finance Tracker System - API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Transactions](#transactions)
- [Budgets](#budgets)
- [Goals](#goals)
- [Notifications](#notifications)
- [Reports](#reports)
- [Dashboard](#dashboard)
- [Currency](#currency)
- [Error Handling](#error-handling)

## Base URL

All API endpoints are relative to the base URL: `/api`

## Authentication

### Register User

- **Endpoint**: `POST /auth/register`
- **Description**: Creates a new user account
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "user" or "admin"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "username": "string",
    "role": "string",
    "createdAt": "string"
  }
  ```

### Login

- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and returns a JWT token
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "role": "string"
    }
  }
  ```

## Transactions

### Create Transaction

- **Endpoint**: `POST /transactions`
- **Description**: Creates a new transaction
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "type": "income" or "expense",
    "amount": number,
    "category": "string",
    "description": "string",
    "date": "YYYY-MM-DD",
    "tags": ["string"],
    "isRecurring": boolean,
    "recurringDetails": {
      "frequency": "daily", "weekly", "monthly", or "yearly",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "user": "string",
    "type": "string",
    "amount": number,
    "category": "string",
    "description": "string",
    "date": "string",
    "tags": ["string"],
    "isRecurring": boolean,
    "recurringDetails": {
      "frequency": "string",
      "startDate": "string",
      "endDate": "string",
      "lastProcessed": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Transactions

- **Endpoint**: `GET /transactions`
- **Description**: Retrieves all transactions for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `type`: Filter by transaction type (income, expense)
  - `category`: Filter by category
  - `tags`: Filter by tags (comma-separated)
  - `startDate`: Filter by start date (YYYY-MM-DD)
  - `endDate`: Filter by end date (YYYY-MM-DD)
- **Response**: 200 OK
  ```json
  [
    {
      "id": "string",
      "user": "string",
      "type": "string",
      "amount": number,
      "category": "string",
      "description": "string",
      "date": "string",
      "tags": ["string"],
      "isRecurring": boolean,
      "recurringDetails": {
        "frequency": "string",
        "startDate": "string",
        "endDate": "string",
        "lastProcessed": "string"
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Update Transaction

- **Endpoint**: `PUT /transactions/:id`
- **Description**: Updates a specific transaction
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Transaction ID
- **Request Body**: Any transaction properties to update
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "type": "string",
    "amount": number,
    "category": "string",
    "description": "string",
    "date": "string",
    "tags": ["string"],
    "isRecurring": boolean,
    "recurringDetails": {
      "frequency": "string",
      "startDate": "string",
      "endDate": "string",
      "lastProcessed": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Transaction

- **Endpoint**: `DELETE /transactions/:id`
- **Description**: Deletes a specific transaction
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Transaction ID
- **Response**: 200 OK
  ```json
  {
    "message": "Transaction deleted successfully"
  }
  ```

## Budgets

### Create Budget

- **Endpoint**: `POST /budgets`
- **Description**: Creates a new budget
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "type": "monthly" or "category",
    "category": "string" (required if type is "category"),
    "amount": number,
    "month": "YYYY-MM-DD" (required if type is "monthly"),
    "warningThreshold": number (percentage, default: 80)
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "user": "string",
    "type": "string",
    "category": "string",
    "amount": number,
    "month": "string",
    "currentSpending": number,
    "warningThreshold": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Budgets

- **Endpoint**: `GET /budgets`
- **Description**: Retrieves all budgets for the authenticated user
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  [
    {
      "id": "string",
      "user": "string",
      "type": "string",
      "category": "string",
      "amount": number,
      "month": "string",
      "currentSpending": number,
      "warningThreshold": number,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Update Budget

- **Endpoint**: `PUT /budgets/:id`
- **Description**: Updates a specific budget
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Budget ID
- **Request Body**: Any budget properties to update
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "type": "string",
    "category": "string",
    "amount": number,
    "month": "string",
    "currentSpending": number,
    "warningThreshold": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Budget Analytics

- **Endpoint**: `GET /budgets/analytics`
- **Description**: Retrieves analytics for all budgets of the authenticated user
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  [
    {
      "budget": {
        "id": "string",
        "user": "string",
        "type": "string",
        "category": "string",
        "amount": number,
        "month": "string",
        "currentSpending": number,
        "warningThreshold": number
      },
      "totalSpent": number,
      "percentageUsed": number,
      "remaining": number,
      "status": "safe", "warning", or "exceeded"
    }
  ]
  ```

### Get Budget Recommendations

- **Endpoint**: `GET /budgets/recommendations`
- **Description**: Retrieves budget recommendations based on spending history
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  {
    "recommendations": [
      {
        "category": "string",
        "recommendedAmount": number,
        "averageSpending": number,
        "percentageOfIncome": number
      }
    ],
    "message": "string"
  }
  ```

## Goals

### Create Goal

- **Endpoint**: `POST /goals`
- **Description**: Creates a new financial goal
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "targetDate": "YYYY-MM-DD",
    "category": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "user": "string",
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "currentAmount": number,
    "currency": "string",
    "targetDate": "string",
    "category": "string",
    "status": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number,
    "transactions": [],
    "progressPercentage": number,
    "remainingAmount": number,
    "daysRemaining": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Goal

- **Endpoint**: `DELETE /goals/:id`
- **Description**: Deletes a specific goal
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Response**: 200 OK
  ```json
  {
    "message": "Goal deleted successfully"
  }
  ```

### Add Contribution

- **Endpoint**: `POST /goals/:id/contribute`
- **Description**: Adds a contribution to a specific goal
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Request Body**:
  ```json
  {
    "amount": number,
    "description": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "currentAmount": number,
    "currency": "string",
    "targetDate": "string",
    "category": "string",
    "status": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number,
    "transactions": [
      {
        "id": "string",
        "amount": number,
        "description": "string",
        "date": "string"
      }
    ],
    "progressPercentage": number,
    "remainingAmount": number,
    "daysRemaining": number
  }
  ```

## Notifications

### Get Notifications

- **Endpoint**: `GET /notifications`
- **Description**: Retrieves all notifications for the authenticated user
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  [
    {
      "id": "string",
      "user": "string",
      "transaction": {
        "id": "string",
        "type": "string",
        "amount": number,
        "category": "string",
        "description": "string",
        "date": "string"
      },
      "type": "upcoming" or "missed",
      "message": "string",
      "isRead": boolean,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Mark Notification as Read

- **Endpoint**: `PUT /notifications/:id/read`
- **Description**: Marks a notification as read
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Notification ID
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "transaction": "string",
    "type": "string",
    "message": "string",
    "isRead": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## Reports

### Get Financial Report

- **Endpoint**: `GET /reports`
- **Description**: Generates a financial report for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `startDate`: Start date for the report (YYYY-MM-DD)
  - `endDate`: End date for the report (YYYY-MM-DD)
  - `category`: Filter by category (optional)
  - `tags`: Filter by tags (comma-separated, optional)
- **Response**: 200 OK
  ```json
  {
    "monthlyData": {
      "YYYY-MM": {
        "income": number,
        "expenses": number,
        "categories": {
          "category1": number,
          "category2": number
        },
        "tags": {
          "tag1": number,
          "tag2": number
        }
      }
    },
    "summary": {
      "totalIncome": number,
      "totalExpenses": number,
      "netSavings": number,
      "averageMonthlyIncome": number,
      "averageMonthlyExpenses": number,
      "monthsAnalyzed": number
    },
    "trends": {
      "incomeGrowth": [
        {
          "month": "YYYY-MM",
          "growth": number
        }
      ],
      "expenseGrowth": [
        {
          "month": "YYYY-MM",
          "growth": number
        }
      ],
      "topCategories": {},
      "topTags": {}
    }
  }
  ```

## Dashboard

### Get Admin Dashboard

- **Endpoint**: `GET /dashboard/admin`
- **Description**: Provides system-wide overview for administrators
- **Authentication**: Required
- **Authorization**: Admin role required
- **Response**: 200 OK
  ```json
  {
    "userStats": {
      "totalUsers": number,
      "newUsersThisMonth": number
    },
    "activityStats": {
      "totalTransactions": number,
      "transactionsThisMonth": number,
      "activeGoals": number,
      "unreadNotifications": number
    },
    "financialSummary": {
      "income": {
        "total": number,
        "average": number,
        "count": number
      },
      "expenses": {
        "total": number,
        "average": number,
        "count": number
      },
      "topCategories": [
        {
          "_id": "string",
          "total": number,
          "count": number
        }
      ]
    },
    "recentActivity": [
      {
        "id": "string",
        "user": {
          "username": "string"
        },
        "type": "string",
        "amount": number,
        "category": "string",
        "date": "string"
      }
    ]
  }
  ```

### Get User Dashboard

- **Endpoint**: `GET /dashboard/user`
- **Description**: Provides personalized financial overview for regular users
- **Authentication**: Required
- **Authorization**: User or Admin role required
- **Response**: 200 OK
  ```json
  {
    "recentTransactions": [
      {
        "id": "string",
        "type": "string",
        "amount": number,
        "category": "string",
        "description": "string",
        "date": "string"
      }
    ],
    "budgetSummary": [
      {
        "budget": {
          "id": "string",
          "type": "string",
          "category": "string",
          "amount": number,
          "month": "string",
          "warningThreshold": number
        },
        "totalSpent": number,
        "percentageUsed": number,
        "remaining": number,
        "status": "safe", "warning", or "exceeded"
      }
    ],
    "goals": [
      {
        "id": "string",
        "title": "string",
        "targetAmount": number,
        "currentAmount": number,
        "targetDate": "string",
        "status": "string",
        "progressPercentage": number,
        "daysRemaining": number
      }
    ],
    "spendingTrends": {
      "monthlyData": {},
      "summary": {},
      "trends": {}
    },
    "notifications": [
      {
        "id": "string",
        "message": "string",
        "type": "string",
        "createdAt": "string"
      }
    ],
    "monthlyFinancials": {
      "income": number,
      "expenses": number,
      "balance": number
    }
  }
  ```

## Currency

### Get Exchange Rates

- **Endpoint**: `GET /currency/rates/:baseCurrency?`
- **Description**: Retrieves current exchange rates
- **Authentication**: None
- **URL Parameters**:
  - `baseCurrency`: Optional base currency code (default: USD)
- **Response**: 200 OK
  ```json
  {
    "base": "string",
    "date": "string",
    "rates": {
      "EUR": number,
      "GBP": number,
      "JPY": number
    }
  }
  ```

### Convert Currency

- **Endpoint**: `POST /currency/convert`
- **Description**: Converts an amount from one currency to another
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "amount": number,
    "from": "string",
    "to": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "amount": number,
    "from": "string",
    "to": "string",
    "result": number,
    "rate": number
  }
  ```

### Get Preferred Currency

- **Endpoint**: `GET /currency/preference`
- **Description**: Retrieves the user's preferred currency
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  {
    "currency": "string"
  }
  ```

### Update Preferred Currency

- **Endpoint**: `PUT /currency/preference`
- **Description**: Updates the user's preferred currency
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "currency": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "message": "Preferred currency updated successfully",
    "currency": "string"
  }
  ```

### Refresh Exchange Rates

- **Endpoint**: `POST /currency/refresh/:baseCurrency?`
- **Description**: Manually refreshes exchange rates from external API
- **Authentication**: Required
- **Authorization**: Admin role required
- **URL Parameters**:
  - `baseCurrency`: Optional base currency code (default: USD)
- **Response**: 200 OK
  ```json
  {
    "message": "Exchange rates refreshed successfully",
    "rates": {
      "base": "string",
      "date": "string",
      "rates": {}
    }
  }
  ```

## Error Handling

All API endpoints follow a consistent error handling pattern:

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Error Response Format

```json
{
  "message": "Error description",
  "stack": "Error stack trace" (only in development environment)
}
``` number,
    "daysRemaining": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Get Goals

- **Endpoint**: `GET /goals`
- **Description**: Retrieves all goals for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by goal status (active, completed, cancelled)
  - `category`: Filter by category
- **Response**: 200 OK
  ```json
  [
    {
      "id": "string",
      "user": "string",
      "title": "string",
      "description": "string",
      "targetAmount": number,
      "currentAmount": number,
      "currency": "string",
      "targetDate": "string",
      "category": "string",
      "status": "string",
      "autoAllocate": boolean,
      "allocationPercentage": number,
      "transactions": [],
      "progressPercentage": number,
      "remainingAmount": number,
      "daysRemaining": number,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Get Goal by ID

- **Endpoint**: `GET /goals/:id`
- **Description**: Retrieves a specific goal by ID
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "currentAmount": number,
    "currency": "string",
    "targetDate": "string",
    "category": "string",
    "status": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number,
    "transactions": [
      {
        "id": "string",
        "amount": number,
        "description": "string",
        "date": "string"
      }
    ],
    "progressPercentage": number,
    "remainingAmount": number,
    "daysRemaining": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Update Goal

- **Endpoint**: `PUT /goals/:id`
- **Description**: Updates a specific goal
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Request Body**: Any goal properties to update
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "currentAmount": number,
    "currency": "string",
    "targetDate": "string",
    "category": "string",
    "status": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number,
    "transactions": [],
    "progressPercentage": number,
    "remainingAmount": number,
    "daysRemaining": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Delete Goal

- **Endpoint**: `DELETE /goals/:id`
- **Description**: Deletes a specific goal
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Response**: 200 OK
  ```json
  {
    "message": "Goal deleted successfully"
  }
  ```

### Add Contribution

- **Endpoint**: `POST /goals/:id/contribute`
- **Description**: Adds a contribution to a specific goal
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Goal ID
- **Request Body**:
  ```json
  {
    "amount": number,
    "description": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "title": "string",
    "description": "string",
    "targetAmount": number,
    "currentAmount": number,
    "currency": "string",
    "targetDate": "string",
    "category": "string",
    "status": "string",
    "autoAllocate": boolean,
    "allocationPercentage": number,
    "transactions": [
      {
        "id": "string",
        "amount": number,
        "description": "string",
        "date": "string"
      }
    ],
    "progressPercentage": number,
    "remainingAmount": number,
    "daysRemaining": number
  }
  ```

## Notifications

### Get Notifications

- **Endpoint**: `GET /notifications`
- **Description**: Retrieves all notifications for the authenticated user
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  [
    {
      "id": "string",
      "user": "string",
      "transaction": {
        "id": "string",
        "type": "string",
        "amount": number,
        "category": "string",
        "description": "string",
        "date": "string"
      },
      "type": "upcoming" or "missed",
      "message": "string",
      "isRead": boolean,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### Mark Notification as Read

- **Endpoint**: `PUT /notifications/:id/read`
- **Description**: Marks a notification as read
- **Authentication**: Required
- **URL Parameters**:
  - `id`: Notification ID
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "user": "string",
    "transaction": "string",
    "type": "string",
    "message": "string",
    "isRead": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## Reports

### Get Financial Report

- **Endpoint**: `GET /reports`
- **Description**: Generates a financial report for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `startDate`: Start date for the report (YYYY-MM-DD)
  - `endDate`: End date for the report (YYYY-MM-DD)
  - `category`: Filter by category (optional)
  - `tags`: Filter by tags (comma-separated, optional)
- **Response**: 200 OK
  ```json
  {
    "monthlyData": {
      "YYYY-MM": {
        "income": number,
        "expenses": number,
        "categories": {
          "category1": number,
          "category2": number
        },
        "tags": {
          "tag1": number,
          "tag2": number
        }
      }
    },
    "summary": {
      "totalIncome": number,
      "totalExpenses": number,
      "netSavings": number,
      "averageMonthlyIncome": number,
      "averageMonthlyExpenses": number,
      "monthsAnalyzed": number
    },
    "trends": {
      "incomeGrowth": [
        {
          "month": "YYYY-MM",
          "growth": number
        }
      ],
      "expenseGrowth": [
        {
          "month": "YYYY-MM",
          "growth": number
        }
      ],
      "topCategories": {},
      "topTags": {}
    }
  }
  ```

## Dashboard

### Get Admin Dashboard

- **Endpoint**: `GET /dashboard/admin`
- **Description**: Provides system-wide overview for administrators
- **Authentication**: Required
- **Authorization**: Admin role required
- **Response**: 200 OK
  ```json
  {
    "userStats": {
      "totalUsers": number,
      "newUsersThisMonth": number
    },
    "activityStats": {
      "totalTransactions": number,
      "transactionsThisMonth": number,
      "activeGoals": number,
      "unreadNotifications": number
    },
    "financialSummary": {
      "income": {
        "total": number,
        "average": number,
        "count": number
      },
      "expenses": {
        "total": number,
        "average": number,
        "count": number
      },
      "topCategories": [
        {
          "_id": "string",
          "total": number,
          "count": number
        }
      ]
    },
    "recentActivity": [
      {
        "id": "string",
        "user": {
          "username": "string"
        },
        "type": "string",
        "amount": number,
        "category": "string",
        "date": "string"
      }
    ]
  }
  ```

### Get User Dashboard

- **Endpoint**: `GET /dashboard/user`
- **Description**: Provides personalized financial overview for regular users
- **Authentication**: Required
- **Authorization**: User or Admin role required
- **Response**: 200 OK
  ```json
  {
    "recentTransactions": [
      {
        "id": "string",
        "type": "string",
        "amount": number,
        "category": "string",
        "description": "string",
        "date": "string"
      }
    ],
    "budgetSummary": [
      {
        "budget": {
          "id": "string",
          "type": "string",
          "category": "string",
          "amount": number,
          "month": "string",
          "warningThreshold": number
        },
        "totalSpent": number,
        "percentageUsed": number,
        "remaining": number,
        "status": "safe", "warning", or "exceeded"
      }
    ],
    "goals": [
      {
        "id": "string",
        "title": "string",
        "targetAmount": number,
        "currentAmount": number,
        "targetDate": "string",
        "status": "string",
        "progressPercentage": number,
        "daysRemaining": number
      }
    ],
    "spendingTrends": {
      "monthlyData": {},
      "summary": {},
      "trends": {}
    },
    "notifications": [
      {
        "id": "string",
        "message": "string",
        "type": "string",
        "createdAt": "string"
      }
    ],
    "monthlyFinancials": {
      "income": number,
      "expenses": number,
      "balance": number
    }
  }
  ```

## Currency

### Get Exchange Rates

- **Endpoint**: `GET /currency/rates/:baseCurrency?`
- **Description**: Retrieves current exchange rates
- **Authentication**: None
- **URL Parameters**:
  - `baseCurrency`: Optional base currency code (default: USD)
- **Response**: 200 OK
  ```json
  {
    "base": "string",
    "date": "string",
    "rates": {
      "EUR": number,
      "GBP": number,
      "JPY": number
    }
  }
  ```

### Convert Currency

- **Endpoint**: `POST /currency/convert`
- **Description**: Converts an amount from one currency to another
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "amount": number,
    "from": "string",
    "to": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "amount": number,
    "from": "string",
    "to": "string",
    "result": number,
    "rate": number
  }
  ```

### Get Preferred Currency

- **Endpoint**: `GET /currency/preference`
- **Description**: Retrieves the user's preferred currency
- **Authentication**: Required
- **Response**: 200 OK
  ```json
  {
    "currency": "string"
  }
  ```

### Update Preferred Currency

- **Endpoint**: `PUT /currency/preference`
- **Description**: Updates the user's preferred currency
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "currency": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "message": "Preferred currency updated successfully",
    "currency": "string"
  }
  ```

### Refresh Exchange Rates

- **Endpoint**: `POST /currency/refresh/:baseCurrency?`
- **Description**: Manually refreshes exchange rates from external API
- **Authentication**: Required
- **Authorization**: Admin role required
- **URL Parameters**:
  - `baseCurrency`: Optional base currency code (default: USD)
- **Response**: 200 OK
  ```json
  {
    "message": "Exchange rates refreshed successfully",
    "rates": {
      "base": "string",
      "date": "string",
      "rates": {}
    }
  }
  ```

## Error Handling

All API endpoints follow a consistent error handling pattern:

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Error Response Format

```json
{
  "message": "Error description",
  "stack": "Error stack trace" (only in development environment)
}
```