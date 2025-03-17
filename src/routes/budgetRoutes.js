const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createBudget,
  getBudgets,
  updateBudget,
  getBudgetAnalytics,
  getBudgetRecommendations
} = require("../controllers/budgetController");

router.use(verifyToken);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/analytics", getBudgetAnalytics);
router.put("/:id", updateBudget);
// Add this route to your existing routes
router.get('/recommendations', verifyToken, getBudgetRecommendations);
module.exports = router;