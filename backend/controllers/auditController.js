const { query } = require("../services/auditLogger");

// GET /api/audit?action=&actor=&from=&to=&limit=   (solo Super Admin)
const listAudit = (req, res) => {
  const { action, actor, from, to, limit } = req.query;
  res.json({ entries: query({ action, actor, from, to, limit }) });
};

module.exports = { listAudit };
