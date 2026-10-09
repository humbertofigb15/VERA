const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { getJwtSecret } = require("../config/jwtSecret");

test("JWT secret must exist and contain at least 32 characters", () => {
  const originalSecret = process.env.JWT_SECRET;

  try {
    delete process.env.JWT_SECRET;
    assert.throws(
      () => getJwtSecret(),
      /JWT_SECRET must be set to at least 32 characters/
    );

    process.env.JWT_SECRET = "too-short";
    assert.throws(
      () => getJwtSecret(),
      /JWT_SECRET must be set to at least 32 characters/
    );

    process.env.JWT_SECRET = "a".repeat(32);
    assert.equal(getJwtSecret(), "a".repeat(32));
  } finally {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});

test("backend refuses to start without a valid JWT secret", () => {
  const result = spawnSync(process.execPath, ["server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, JWT_SECRET: "" },
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET must be set to at least 32 characters/);
});
