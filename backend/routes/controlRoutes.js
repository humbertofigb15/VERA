const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { PLANNING_CREATE_ROLES } = require("../config/roles");
const { listControls, createControl, updateControl, evaluateControl } = require("../controllers/controlController");

router.get("/", verifyToken, listControls);
router.post("/", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), createControl);
router.put("/:id", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), updateControl);
router.post("/:id/evaluate", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), evaluateControl);

module.exports = router;
