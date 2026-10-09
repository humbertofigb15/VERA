const test = require("node:test");
const assert = require("node:assert/strict");
const { parseProposal } = require("../controllers/planningController");

const validProposal = {
  title: "  Revisión de controles  ",
  objective: "Validar que los controles se ejecuten de forma oportuna.",
  area: " Finanzas ",
  type: "Interna",
  risk: "Medio",
  year: 2026,
  quarter: "Q2",
  startDate: "2026-04-01",
  endDate: "2026-06-30",
  responsibleId: 5
};

test("proposal parser trims text and derives a consistent risk score", () => {
  const result = parseProposal(validProposal);
  assert.equal(result.error, undefined);
  assert.equal(result.data.title, "Revisión de controles");
  assert.equal(result.data.area, "Finanzas");
  assert.equal(result.data.likelihood, 2);
  assert.equal(result.data.impact, 2);
  assert.equal(result.data.riskScore, 4);
  assert.equal(result.data.risk, "Medio");
  assert.equal(result.data.responsibleId, 5);
});

test("proposal parser rejects missing fields, invalid catalogs, dates and inactive auditors", () => {
  const invalidCases = [
    [{ ...validProposal, title: " " }, /título/],
    [{ ...validProposal, objective: "" }, /título/],
    [{ ...validProposal, area: " " }, /título/],
    [{ ...validProposal, type: "No válida" }, /tipo/],
    [{ ...validProposal, risk: "Crítico" }, /riesgo/],
    [{ ...validProposal, likelihood: 4 }, /probabilidad/],
    [{ ...validProposal, quarter: "Q5" }, /trimestre/],
    [{ ...validProposal, year: 2101 }, /año/],
    [{ ...validProposal, startDate: "01/04/2026" }, /fechas/],
    [{ ...validProposal, startDate: "2026-06-30", endDate: "2026-04-01" }, /anterior/],
    [{ ...validProposal, responsibleId: 6 }, /auditor activo/]
  ];

  for (const [proposal, expectedMessage] of invalidCases) {
    const result = parseProposal(proposal);
    assert.match(result.error, expectedMessage);
    assert.equal(result.data, undefined);
  }
});
