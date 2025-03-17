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

router.use(verifyToken);

// Goal management routes
router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

// Goal contribution route
router.post("/:id/contribute", addContribution);

module.exports = router;