# Authentication Controllers Documentation

## Overview

The `authcontrollers.js` file contains functionality for user authentication in the Personal Finance Tracker System. It handles user registration and login processes, including password hashing and JWT token generation.

## Dependencies

```javascript
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SALT_ROUNDS } = require("../constants/constants");
```

## Functions

### register

```javascript
const register = async (req, res) => {
  // Function implementation
};
```

**Description**: This function handles user registration by creating a new user account with a hashed password.

**Parameters**:

- `req`: Express request object containing user registration data in the request body
- `res`: Express response object used to send the registration result

**Request Body**:

- `username`: User's unique username
- `password`: User's password (will be hashed before storage)
- `role`: User's role ("admin" or "user")

**Process Flow**:

1. Extracts user data from request body
2. Hashes the password using bcrypt with the defined salt rounds
3. Creates a new User document with the provided data
4. Saves the user to the database
5. Returns a success message with 201 Created status

**Error Handling**:

- Catches and returns any errors that occur during registration with a 500 status code

**Response**:

- Success: 201 Created with success message
- Error: 500 Internal Server Error with error message

### login

```javascript
const login = async (req, res) => {
  // Function implementation
};
```

**Description**: This function authenticates a user by verifying their credentials and issues a JWT token upon successful authentication.

**Parameters**:

- `req`: Express request object containing login credentials in the request body
- `res`: Express response object used to send the login result

**Request Body**:

- `username`: User's username
- `password`: User's password

**Process Flow**:

1. Extracts login credentials from request body
2. Finds the user in the database by username
3. If user not found, returns a 404 Not Found response
4. Compares the provided password with the stored hashed password
5. If passwords don't match, returns a 400 Bad Request response
6. If authentication is successful, generates a JWT token with user ID and role
7. Returns the token with a 200 OK status

**Error Handling**:

- User not found: 404 Not Found response
- Invalid password: 400 Bad Request response
- Other errors: 500 Internal Server Error with error message

**Response**:

- Success: 200 OK with JWT token
- User not found: 404 Not Found
- Invalid credentials: 400 Bad Request
- Error: 500 Internal Server Error with error message

## Usage

These controllers are used in the authentication routes:

```javascript
router.post("/register", register);
router.post("/login", login);
```

## Integration Points

- **User Model**: Creates and queries user records
- **JWT**: Generates authentication tokens
- **bcrypt**: Handles password hashing and comparison
- **Auth Routes**: Exposes the authentication endpoints
