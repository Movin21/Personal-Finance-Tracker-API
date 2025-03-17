const express = require("express");
const router = express.Router();
const verfiyToken = require("../middleware/authMiddleware");
const userRole = require("../middleware/roleMiddleware");

//admin only access route
router.get("/admin", verfiyToken, userRole("admin"), (req, res) => {
  res.send("Admin Dashboard");
});

//user+admin access  route
router.get("/user", verfiyToken, userRole("user", "admin"), (req, res) => {
  res.send("User Dashboard");
});

module.exports = router;
