const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { PLANNING_CREATE_ROLES } = require("../config/roles");
const { listRisks, listOwners, createRisk, updateRisk, evaluateRisk } = require("../controllers/riskController");

router.get("/", verifyToken, listRisks);
router.get("/owners", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), listOwners);
router.post("/", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), createRisk);
router.put("/:id", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), updateRisk);
router.post("/:id/evaluate", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), evaluateRisk);

module.exports = router;
