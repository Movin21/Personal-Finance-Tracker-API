const express = require("express");
const router = express.Router();
const {
  getExchangeRates,
  convertCurrency,
  updatePreferredCurrency,
  getPreferredCurrency,
  refreshExchangeRates,
} = require("../controllers/currencyController");
const protect = require("../middleware/authMiddleware");
const authorizedRoles = require("../middleware/roleMiddleware");

// Public routes
router.get("/rates/:baseCurrency?", getExchangeRates);
router.post("/convert", convertCurrency);

// Protected routes (require authentication)
router.get("/preference", protect, getPreferredCurrency);
router.put("/preference", protect, updatePreferredCurrency);

// Admin routes
router.post(
  "/refresh/:baseCurrency?",
  protect,
  authorizedRoles("admin"),
  refreshExchangeRates
);

module.exports = router;
