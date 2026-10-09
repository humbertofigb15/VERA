const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const app = require("../server");

test("GET / responds with the API health message", async (context) => {
  const server = createServer(app);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    message: "VERA API funcionando correctamente"
  });
});
