const { STATUS_CODES, MESSAGES } = require("../constants/constants");

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(STATUS_CODES.NOT_FOUND);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode === STATUS_CODES.OK
      ? STATUS_CODES.INTERNAL_SERVER_ERROR
      : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message || MESSAGES.SERVER_ERROR,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
