const test = require("node:test");
const assert = require("node:assert/strict");
const { buildNotifications } = require("../services/notificationService");

const now = Date.parse("2026-10-09T12:00:00.000Z");

test("notification service ranks high before medium and low items deterministically", () => {
  const proposals = [
    { id: "AUD-HIGH", status: "OPEN", title: "Riesgo alto", area: "A", risk: "Alto", createdAt: "2026-10-08T12:00:00.000Z" },
    { id: "AUD-MED", status: "OPEN", title: "Riesgo medio", area: "B", risk: "Medio", createdAt: "2026-10-09T11:00:00.000Z" },
    { id: "AUD-APPROVED", status: "APPROVED", title: "Lista", area: "C", risk: "Bajo", quarter: "Q4", year: 2026, createdAt: "2026-10-08T10:00:00.000Z" }
  ];

  const notifications = buildNotifications({ proposals, user: { id: 2, role: "DIRECTOR" }, now });
  assert.deepEqual(notifications.map(({ priority }) => priority), ["HIGH", "MEDIUM", "MEDIUM"]);
  assert.equal(notifications[0].id, "PROPOSAL_REVIEW:AUD-HIGH");
  assert.equal(notifications[1].id, "PROPOSAL_REVIEW:AUD-MED");
  assert.equal(notifications[2].type, "AUDIT_START");
  assert.equal(notifications[2].path, "/auditorias-activas");
});

test("auditor notifications are scoped to assignments and classify overdue/due-soon dates", () => {
  const proposals = [
    { id: "AUD-OVERDUE", status: "ACTIVE", responsibleId: 5, title: "Vencida", area: "A", endDate: "2026-10-08", createdAt: "2026-10-01T00:00:00.000Z" },
    { id: "AUD-SOON", status: "ACTIVE", responsibleId: 5, title: "Próxima", area: "B", endDate: "2026-10-15", createdAt: "2026-10-02T00:00:00.000Z" },
    { id: "AUD-LATER", status: "ACTIVE", responsibleId: 5, title: "Posterior", area: "C", endDate: "2026-10-30", createdAt: "2026-10-03T00:00:00.000Z" },
    { id: "AUD-OTHER", status: "ACTIVE", responsibleId: 4, title: "Otra asignación", area: "D", endDate: "2026-10-08", createdAt: "2026-10-04T00:00:00.000Z" }
  ];

  const notifications = buildNotifications({ proposals, user: { id: 5, role: "AUDITOR" }, now });
  assert.deepEqual(notifications.map(({ id, priority }) => [id, priority]), [
    ["AUDIT_FOLLOW_UP:AUD-OVERDUE", "HIGH"],
    ["AUDIT_FOLLOW_UP:AUD-SOON", "MEDIUM"],
    ["AUDIT_FOLLOW_UP:AUD-LATER", "LOW"]
  ]);
});
