/**
 * Helper functions for Artillery.io load tests
 */

// Store pre-defined test users
const testUsers = [
  { username: 'load_test_user1', password: 'password123' },
  { username: 'load_test_user2', password: 'password123' },
  { username: 'load_test_user3', password: 'password123' },
  { username: 'load_test_user4', password: 'password123' },
  { username: 'load_test_user5', password: 'password123' }
];

const adminUsers = [
  { username: 'load_test_admin1', password: 'password123' },
  { username: 'load_test_admin2', password: 'password123' }
];

/**
 * Generate random user credentials from the predefined list
 * This prevents creating new users for every test run
 */
function generateUserCredentials(userContext, events, done) {
  // Select a random user from the predefined list
  const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Set the user credentials in the context for use in the scenario
  userContext.vars.username = randomUser.username;
  userContext.vars.password = randomUser.password;
  
  return done();
}

/**
 * Generate random admin credentials from the predefined list
 */
function generateAdminCredentials(userContext, events, done) {
  // Select a random admin from the predefined list
  const randomAdmin = adminUsers[Math.floor(Math.random() * adminUsers.length)];
  
  // Set the admin credentials in the context for use in the scenario
  userContext.vars.username = randomAdmin.username;
  userContext.vars.password = randomAdmin.password;
  
  return done();
}

/**
 * Setup function to create test users in the database before running load tests
 * This should be run once before the load test starts
 */
function setupTestUsers() {
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');
  const User = require('../../src/models/userModel');
  const dotenv = require('dotenv');
  
  dotenv.config();
  
  // Connect to the database
  mongoose.connect(process.env.CONNECTION_STRING)
    .then(async () => {
      console.log('Connected to database for test user setup');
      
      // Hash password for all test users
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create regular test users if they don't exist
      for (const user of testUsers) {
        const existingUser = await User.findOne({ username: user.username });
        if (!existingUser) {
          await User.create({
            username: user.username,
            password: hashedPassword,
            role: 'user'
          });
          console.log(`Created test user: ${user.username}`);
        }
      }
      
      // Create admin test users if they don't exist
      for (const admin of adminUsers) {
        const existingAdmin = await User.findOne({ username: admin.username });
        if (!existingAdmin) {
          await User.create({
            username: admin.username,
            password: hashedPassword,
            role: 'admin'
          });
          console.log(`Created admin user: ${admin.username}`);
        }
      }
      
      console.log('Test user setup complete');
      mongoose.disconnect();
    })
    .catch(err => {
      console.error('Error setting up test users:', err);
      process.exit(1);
    });
}

// Export the functions for use in Artillery tests
module.exports = {
  generateUserCredentials,
  generateAdminCredentials,
  setupTestUsers
};