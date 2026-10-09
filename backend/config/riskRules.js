const classifyRisk = (score) => score <= 2 ? "Bajo" : score <= 4 ? "Medio" : "Alto";

module.exports = { classifyRisk };
