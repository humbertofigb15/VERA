const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { PLANNING_CREATE_ROLES, PLANNING_APPROVE_ROLES } = require("../config/roles");
const {
  listProposals,
  listAuditors,
  createProposal,
  updateProposal,
  approveProposal,
  deleteProposal
} = require("../controllers/planningController");

// Todos los usuarios con sesión pueden consultar el tablero.
router.get("/", verifyToken, listProposals);
router.get("/auditors", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), listAuditors);

router.post("/", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), createProposal);
router.put("/:id", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), updateProposal);
router.delete("/:id", verifyToken, allowRoles(...PLANNING_CREATE_ROLES), deleteProposal);
router.post("/:id/approve", verifyToken, allowRoles(...PLANNING_APPROVE_ROLES), approveProposal);

module.exports = router;
