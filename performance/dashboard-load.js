import http from "k6/http";
import { check, sleep } from "k6";

const target = __ENV.VERA_STAGING_URL;
const token = __ENV.VERA_LOAD_TEST_TOKEN;
const allowedHost = __ENV.VERA_LOAD_TEST_ALLOWED_HOST;
function validateConfiguration() {
  if (!target || !token || !allowedHost) {
    throw new Error("Set VERA_STAGING_URL, VERA_LOAD_TEST_TOKEN, and VERA_LOAD_TEST_ALLOWED_HOST before running this test.");
  }

  const match = /^https:\/\/([^/?#]+)\/?$/i.exec(target);
  if (!match || match[1].includes("@")) {
    throw new Error("Use an HTTPS staging origin without embedded credentials, path, query string, or fragment.");
  }

  if (match[1].toLowerCase() !== allowedHost.toLowerCase()) {
    throw new Error("The staging URL host does not match VERA_LOAD_TEST_ALLOWED_HOST; refusing to generate load.");
  }
}

validateConfiguration();
const targetHost = /^https:\/\/([^/?#]+)\/?$/i.exec(target)[1];
const baseUrl = `https://${targetHost}`;

export const options = {
  stages: [
    { duration: "1m", target: 150 },
    { duration: "1m", target: 150 },
    { duration: "30s", target: 250 },
    { duration: "1m", target: 250 },
    { duration: "1m", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
    checks: ["rate>0.99"]
  }
};

export default function () {
  const response = http.get(`${baseUrl}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: "dashboard-read" }
  });

  check(response, {
    "dashboard responds with HTTP 200": (res) => res.status === 200,
    "dashboard responds with JSON": (res) => (res.headers["Content-Type"] || "").includes("application/json")
  });

  sleep(1);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const responseTime = metrics.http_req_duration.values;
  const requestCount = metrics.http_reqs.values.count;
  const failedRate = metrics.http_req_failed.values.rate;
  const checkRate = metrics.checks.values.rate;
  const actualDurationMs = data.state.testRunDurationMs;
  const summary = {
    outcome: failedRate < 0.01 && checkRate > 0.99 && responseTime["p(95)"] < 1500 ? "PASS" : "FAIL",
    generatedAtUtc: new Date().toISOString(),
    startedAtUtc: new Date(Date.now() - actualDurationMs).toISOString(),
    durationSeconds: Number((actualDurationMs / 1000).toFixed(2)),
    commit: __ENV.VERA_TEST_COMMIT || "local",
    runId: __ENV.VERA_TEST_RUN_ID || null,
    target: `${baseUrl}/api/dashboard`,
    stages: [150, 250],
    requests: requestCount,
    failedRequestRate: Number((failedRate * 100).toFixed(3)),
    checkSuccessRate: Number((checkRate * 100).toFixed(3)),
    responseMs: {
      average: Number(responseTime.avg.toFixed(2)),
      p90: Number(responseTime["p(90)"].toFixed(2)),
      p95: Number(responseTime["p(95)"].toFixed(2)),
      maximum: Number(responseTime.max.toFixed(2))
    },
    thresholds: { failedRequestRatePercent: "<1%", responseP95Ms: "<1500 ms", endpointStatus: "HTTP 200 JSON" }
  };

  const report = [
    "# VERA — Informe de carga del panel",
    "",
    `- **Resultado:** ${summary.outcome}`,
    `- **Inicio UTC:** ${summary.startedAtUtc}`,
    `- **Fin UTC:** ${summary.generatedAtUtc}`,
    `- **Duración:** ${summary.durationSeconds} s`,
    `- **Commit:** ${summary.commit}`,
    `- **Endpoint:** ${summary.target}`,
    "- **Perfil:** rampa a 150 VUs, sostener 60 s, rampa a 250 VUs, sostener 60 s y reducción gradual.",
    `- **Solicitudes:** ${summary.requests}`,
    `- **Solicitudes fallidas:** ${summary.failedRequestRate}% (umbral <1%)`,
    `- **Checks HTTP 200/JSON:** ${summary.checkSuccessRate}% (umbral >99%)`,
    `- **Latencia promedio:** ${summary.responseMs.average} ms`,
    `- **Latencia p90:** ${summary.responseMs.p90} ms`,
    `- **Latencia p95:** ${summary.responseMs.p95} ms (umbral <1500 ms)`,
    `- **Latencia máxima:** ${summary.responseMs.maximum} ms`,
    "",
    "Este informe mide lecturas concurrentes de la API del panel con una credencial de prueba compartida. No simula sesiones únicas ni prueba almacenamiento binario, persistencia o múltiples regiones."
  ].join("\n");

  return {
    "quality-report/load-summary.json": JSON.stringify(summary, null, 2),
    "quality-report/load-summary.md": report
  };
}
