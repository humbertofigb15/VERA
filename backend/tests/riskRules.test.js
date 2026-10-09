const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyRisk } = require("../config/riskRules");

test("risk matrix classifies each valid probability and impact combination", () => {
  const expected = [
    ["Bajo", "Bajo", "Medio"],
    ["Bajo", "Medio", "Alto"],
    ["Medio", "Alto", "Alto"]
  ];

  for (let likelihood = 1; likelihood <= 3; likelihood += 1) {
    for (let impact = 1; impact <= 3; impact += 1) {
      const score = likelihood * impact;
      assert.equal(classifyRisk(score), expected[likelihood - 1][impact - 1], `${likelihood} x ${impact} = ${score}`);
    }
  }
});

test("risk score category boundaries are stable", () => {
  assert.equal(classifyRisk(1), "Bajo");
  assert.equal(classifyRisk(2), "Bajo");
  assert.equal(classifyRisk(3), "Medio");
  assert.equal(classifyRisk(4), "Medio");
  assert.equal(classifyRisk(6), "Alto");
  assert.equal(classifyRisk(9), "Alto");
});
