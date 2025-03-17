const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  SERVER_ERROR: 'Internal Server Error',
  UNAUTHORIZED: 'Unauthorized Access',
  FORBIDDEN: 'Forbidden Access',
  INVALID_TOKEN: 'Invalid Token',
  NOT_FOUND: 'Resource Not Found'
};

const SALT_ROUNDS = 10;

module.exports = { STATUS_CODES, MESSAGES, SALT_ROUNDS };
