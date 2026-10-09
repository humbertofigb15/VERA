const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { listNotifications } = require("../controllers/notificationController");

router.get("/", verifyToken, listNotifications);

module.exports = router;
