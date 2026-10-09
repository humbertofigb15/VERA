const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET ||= "notifications-integration-test-secret-32-characters";
const app = require("../server");
const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET);
const json = (token, method = "GET", body) => ({
  method,
  headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {})
});

test("HU-17: in-app pending inbox is derived from proposal states and scoped to each role", async (context) => {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const director = tokenFor(2);
  const manager = tokenFor(3);
  const auditor = tokenFor(5);
  const jefatura = tokenFor(4);

  const anonymous = await fetch(`${baseUrl}/api/notifications`);
  assert.equal(anonymous.status, 401);

  const openResponse = await fetch(`${baseUrl}/api/planning`, json(manager, "POST", {
    title: `HU-17 decision ${Date.now()}`,
    objective: "Revisar una propuesta prioritaria para la bandeja.",
    area: "Finanzas", year: 2026, likelihood: 3, impact: 3
  }));
  assert.equal(openResponse.status, 201);
  const openProposal = (await openResponse.json()).proposal;

  const dueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const activeResponse = await fetch(`${baseUrl}/api/planning`, json(manager, "POST", {
    title: `HU-17 assigned ${Date.now()}`,
    objective: "Dar seguimiento a la auditoría asignada y su fecha objetivo.",
    area: "Operaciones", year: 2026, responsibleId: 5, endDate: dueDate
  }));
  const activeProposal = (await activeResponse.json()).proposal;
  const approval = await fetch(`${baseUrl}/api/planning/${activeProposal.id}/approve`, json(director, "POST", { quarter: "Q2" }));
  assert.equal(approval.status, 200);
  const started = await fetch(`${baseUrl}/api/planning/${activeProposal.id}/start`, json(director, "POST", {}));
  assert.equal(started.status, 200);

  const directorResponse = await fetch(`${baseUrl}/api/notifications`, json(director));
  const directorInbox = await directorResponse.json();
  assert.ok(directorInbox.notifications.some((item) => item.entityId === openProposal.id && item.type === "PROPOSAL_REVIEW" && item.priority === "HIGH"));
  assert.ok(directorInbox.generatedAt);
  assert.equal(directorInbox.persisted, false);

  const managerInbox = (await (await fetch(`${baseUrl}/api/notifications`, json(manager))).json()).notifications;
  assert.ok(managerInbox.some((item) => item.entityId === openProposal.id && item.type === "PROPOSAL_TRACK"));

  const auditorInbox = (await (await fetch(`${baseUrl}/api/notifications`, json(auditor))).json()).notifications;
  const followUp = auditorInbox.find((item) => item.entityId === activeProposal.id);
  assert.equal(followUp.type, "AUDIT_FOLLOW_UP");
  assert.equal(followUp.priority, "HIGH");
  assert.equal(followUp.dueAt, dueDate);

  const jefaturaInbox = (await (await fetch(`${baseUrl}/api/notifications`, json(jefatura))).json()).notifications;
  assert.equal(jefaturaInbox.length, 0);
});
