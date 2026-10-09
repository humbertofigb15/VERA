const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET ||= "users-integration-test-secret-at-least-32-characters";

const app = require("../server");
const userRepository = require("../repositories/userRepository");
const { startTestServer } = require("./helpers/testServer");

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET);
const request = (baseUrl, path, { method = "GET", token, body } = {}) => fetch(`${baseUrl}${path}`, {
  method,
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { "Content-Type": "application/json" } : {})
  },
  ...(body ? { body: JSON.stringify(body) } : {})
});

test("RF-02/RF-30: account listings and role changes enforce administrator boundaries", async (context) => {
  const baseUrl = await startTestServer(context, app);
  const target = userRepository.findById(4);
  const originalRole = target.role;
  context.after(() => { target.role = originalRole; });
  const priorSession = tokenFor(target.id);

  const superAdminList = await request(baseUrl, "/api/users", { token: tokenFor(1) });
  assert.equal(superAdminList.status, 200);
  const allUsers = (await superAdminList.json()).users;
  assert.ok(allUsers.some((user) => user.id === 6 && user.status === "PENDING"));

  const directorList = await request(baseUrl, "/api/users", { token: tokenFor(2) });
  assert.equal(directorList.status, 200);
  const visibleUsers = (await directorList.json()).users;
  assert.ok(!visibleUsers.some((user) => user.id === 1 || user.status === "PENDING"));

  const auditorList = await request(baseUrl, "/api/users", { token: tokenFor(5) });
  assert.equal(auditorList.status, 403);
  assert.equal((await request(baseUrl, "/api/users")).status, 401);

  const change = await request(baseUrl, `/api/users/${target.id}/role`, {
    method: "PATCH",
    token: tokenFor(2),
    body: { role: "AUDITOR" }
  });
  assert.equal(change.status, 200);
  assert.equal((await change.json()).user.role, "AUDITOR");
  assert.equal(target.role, "AUDITOR");

  const roleRefresh = await request(baseUrl, "/api/dashboard", { token: priorSession });
  assert.equal(roleRefresh.status, 200);
  assert.equal((await roleRefresh.json()).role, "AUDITOR");

  const selfChange = await request(baseUrl, "/api/users/2/role", {
    method: "PATCH",
    token: tokenFor(2),
    body: { role: "GERENTE" }
  });
  assert.equal(selfChange.status, 403);

  const protectedRole = await request(baseUrl, "/api/users/1/role", {
    method: "PATCH",
    token: tokenFor(2),
    body: { role: "DIRECTOR" }
  });
  assert.equal(protectedRole.status, 403);

  const invalidRole = await request(baseUrl, `/api/users/${target.id}/role`, {
    method: "PATCH",
    token: tokenFor(1),
    body: { role: "OWNER" }
  });
  assert.equal(invalidRole.status, 400);
});

test("RF-02/RF-03: disabling an account immediately invalidates its existing session", async (context) => {
  const baseUrl = await startTestServer(context, app);
  const target = userRepository.findById(4);
  const originalStatus = target.status;
  context.after(() => { target.status = originalStatus; });
  const existingSession = tokenFor(target.id);

  const disabled = await request(baseUrl, `/api/users/${target.id}/status`, {
    method: "PATCH",
    token: tokenFor(2),
    body: { active: false }
  });
  assert.equal(disabled.status, 200);
  assert.equal((await disabled.json()).user.status, "DISABLED");

  const denied = await request(baseUrl, "/api/dashboard", { token: existingSession });
  assert.equal(denied.status, 401);

  const invalidStatus = await request(baseUrl, `/api/users/${target.id}/status`, {
    method: "PATCH",
    token: tokenFor(2),
    body: { active: "false" }
  });
  assert.equal(invalidStatus.status, 400);

  const enabled = await request(baseUrl, `/api/users/${target.id}/status`, {
    method: "PATCH",
    token: tokenFor(2),
    body: { active: true }
  });
  assert.equal(enabled.status, 200);
  assert.equal((await request(baseUrl, "/api/dashboard", { token: existingSession })).status, 200);
});
