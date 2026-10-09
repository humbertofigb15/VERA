const planningRepository = require("../repositories/planningRepository");
const { getDashboardForUser } = require("../services/dashboardService");

const getDashboard = (req, res) => {
  res.json(getDashboardForUser(req.user, planningRepository.getAll()));
};

module.exports = { getDashboard };
