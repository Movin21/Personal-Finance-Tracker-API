const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getFinancialReport } = require("../controllers/reportController");

router.use(verifyToken);

router.get("/", getFinancialReport);

module.exports = router;