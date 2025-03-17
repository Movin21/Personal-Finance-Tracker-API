// Mock environment variables before any tests run
process.env.CONNECTION_STRING = "mongodb://localhost:27017/test-db";
process.env.JWT_SECRET = "test-secret";
process.env.PORT = "5001";

// Global test setup
beforeAll(() => {
  // Add any global setup code here
  console.log("Starting test suite");
});

// Global test teardown
afterAll(() => {
  // Add any global teardown code here
  console.log("Test suite completed");
});
