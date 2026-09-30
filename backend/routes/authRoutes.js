const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { login, verify2FA, setup2FA, enable2FA } = require("../controllers/authController");

router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/2fa/setup", verifyToken, setup2FA);
router.post("/2fa/enable", verifyToken, enable2FA);

module.exports = router;