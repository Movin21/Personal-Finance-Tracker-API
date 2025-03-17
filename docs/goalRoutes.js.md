# Goal Routes Documentation

## Overview

The `goalRoutes.js` file defines the API endpoints for managing financial goals in the Personal Finance Tracker System. It provides functionality for creating, retrieving, updating, and deleting goals, as well as adding contributions to goals.

## Dependencies

```javascript
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
} = require("../controllers/goalController");
```

## Middleware Configuration

```javascript
router.use(verifyToken);
```

**Description**:
- `verifyToken`: Authentication middleware that verifies the JWT token and adds the user information to the request object

## Route Configuration

### Goal Management Routes

```javascript
router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
```

**Description**:
- `POST /`: Creates a new financial goal
- `GET /`: Retrieves all goals for the authenticated user
- `GET /:id`: Retrieves a specific goal by ID
- `PUT /:id`: Updates a specific goal
- `DELETE /:id`: Deletes a specific goal

### Goal Contribution Route

```javascript
router.post("/:id/contribute", addContribution);
```

**Description**:
- `POST /:id/contribute`: Adds a contribution to a specific goal

## Controller Functions

### createGoal

Creates a new financial goal for the authenticated user.

### getGoals

Retrieves all goals for the authenticated user. Supports filtering by status and category.

### getGoalById

Retrieves a specific goal by ID, including its associated transactions.

### updateGoal

Updates a specific goal with new information.

### deleteGoal

Deletes a specific goal.

### addContribution

Adds a manual contribution to a goal and creates a corresponding transaction.

## Additional Functionality

### allocateIncomeToGoals

Automatically allocates a percentage of income transactions to goals with auto-allocation enabled.