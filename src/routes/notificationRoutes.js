const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getNotifications, markAsRead } = require("../controllers/notificationController");

router.use(verifyToken);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;