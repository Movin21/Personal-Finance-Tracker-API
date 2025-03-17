const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizedRoles = require("../middleware/roleMiddleware");
const { getAdminDashboard, getUserDashboard } = require("../controllers/dashboardController");

// Apply authentication middleware to all dashboard routes
router.use(verifyToken);

// Admin dashboard route - restricted to admin role only
router.get("/admin", authorizedRoles("admin"), getAdminDashboard);

// User dashboard route - accessible by both regular users and admins
router.get("/user", authorizedRoles("user", "admin"), getUserDashboard);

module.exports = router;