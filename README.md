# Personal Finance Tracker REST API (Application Frameworks Module _ Assignment 01 (SLIIT SE))

## Overview

The Personal Finance Tracker System is a comprehensive web application designed to help users manage their finances effectively. It provides features for tracking income and expenses, setting and monitoring budgets, managing recurring transactions, and generating financial reports.

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Scheduled Tasks](#scheduled-tasks)

## Features

- **User Authentication**: Secure registration and login system with role-based access control
- **Transaction Management**: Track income and expenses with categorization and tagging
- **Budget Planning**: Create and monitor monthly or category-based budgets
- **Recurring Transactions**: Set up transactions that repeat on a daily, weekly, monthly, or yearly basis
- **Notifications**: Receive alerts for upcoming recurring transactions and budget thresholds
- **Financial Reports**: Generate insights on spending patterns and financial health

## System Architecture

The application follows a modular architecture with the following components:

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Scheduling**: Node-schedule for recurring tasks

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd personal-finance-tracker-system
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
CONNECTION_STRING=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_jwt_secret_key
```

## API Documentation

### Authentication

#### Register User

- **Endpoint**: `POST /api/auth/register`
- **Description**: Creates a new user account
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "user" or "admin"
  }
  ```
- **Response**: 201 Created

#### Login

- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK with JWT token

### Transactions

#### Create Transaction

- **Endpoint**: `POST /api/transactions`
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
- **Response**: 201 Created with transaction object

#### Get Transactions

- **Endpoint**: `GET /api/transactions`
- **Description**: Retrieves all transactions for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `type`: Filter by transaction type
  - `category`: Filter by category
  - `tags`: Filter by tags (comma-separated)
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Response**: 200 OK with array of transactions

### Budgets

#### Create Budget

- **Endpoint**: `POST /api/budgets`
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
- **Response**: 201 Created with budget object

#### Get Budgets

- **Endpoint**: `GET /api/budgets`
- **Description**: Retrieves all budgets for the authenticated user
- **Authentication**: Required
- **Response**: 200 OK with array of budgets

### Notifications

#### Get Notifications

- **Endpoint**: `GET /api/notifications`
- **Description**: Retrieves all notifications for the authenticated user
- **Authentication**: Required
- **Response**: 200 OK with array of notifications

#### Mark Notification as Read

- **Endpoint**: `PATCH /api/notifications/:id/read`
- **Description**: Marks a notification as read
- **Authentication**: Required
- **Response**: 200 OK with updated notification

### Reports

#### Generate Spending Report

- **Endpoint**: `GET /api/reports/spending`
- **Description**: Generates a spending report for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `startDate`: Start date for the report
  - `endDate`: End date for the report
- **Response**: 200 OK with report data

### Goals

#### Create Goal

- **Endpoint**: `POST /api/goals`
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
- **Response**: 201 Created with goal object

#### Get Goals

- **Endpoint**: `GET /api/goals`
- **Description**: Retrieves all goals for the authenticated user
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by goal status (active, completed, cancelled)
  - `category`: Filter by category
- **Response**: 200 OK with array of goals

#### Get Goal by ID

- **Endpoint**: `GET /api/goals/:id`
- **Description**: Retrieves a specific goal by ID
- **Authentication**: Required
- **Response**: 200 OK with goal object including associated transactions

#### Update Goal

- **Endpoint**: `PUT /api/goals/:id`
- **Description**: Updates a specific goal
- **Authentication**: Required
- **Request Body**: Any goal properties to update
- **Response**: 200 OK with updated goal object

#### Delete Goal

- **Endpoint**: `DELETE /api/goals/:id`
- **Description**: Deletes a specific goal
- **Authentication**: Required
- **Response**: 200 OK with success message

#### Add Contribution

- **Endpoint**: `POST /api/goals/:id/contribute`
- **Description**: Adds a contribution to a specific goal
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "amount": number,
    "description": "string"
  }
  ```
- **Response**: 200 OK with updated goal object

## Database Schema

### User Model

```javascript
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);
```

### Transaction Model

```javascript
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      default: Date.now,
    },
    tags: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      startDate: Date,
      endDate: Date,
      lastProcessed: Date,
    },
  },
  { timestamps: true }
);
```

### Budget Model

```javascript
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["monthly", "category"],
      required: true,
    },
    category: {
      type: String,
      required: function () {
        return this.type === "category";
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Date,
      required: function () {
        return this.type === "monthly";
      },
    },
    currentSpending: {
      type: Number,
      default: 0,
    },
    warningThreshold: {
      type: Number,
      default: 80, // Percentage
    },
  },
  { timestamps: true }
);
```

### Notification Model

```javascript
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    type: {
      type: String,
      enum: ["upcoming", "missed"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    dueDate: Date,
  },
  { timestamps: true }
);
```

### Goal Model

```javascript
const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    autoAllocate: {
      type: Boolean,
      default: false,
    },
    allocationPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);
```

## Scheduled Tasks

The system includes two scheduled tasks:

### Process Recurring Transactions

```javascript
// Runs daily at midnight
schedule.scheduleJob("0 0 * * *", processRecurringTransactions);
```

This task:

1. Finds all active recurring transactions
2. Processes transactions based on their frequency (daily, weekly, monthly, yearly)
3. Creates notifications for upcoming transactions within the next 3 days
4. Updates the lastProcessed date for each processed transaction

### Monitor Budgets

```javascript
// Runs every 6 hours
schedule.scheduleJob("0 */6 * * *", monitorBudgets);
```

This task:

1. Checks all user budgets
2. Calculates current spending against budget limits
3. Creates notifications when spending exceeds warning thresholds
4. Updates the currentSpending field for each budget
