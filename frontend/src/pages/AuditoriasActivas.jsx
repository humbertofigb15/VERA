import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCircle2, Play, RefreshCw } from "lucide-react";
import Sidebar from "../components/Sidebar";
import PlanningHistoryButton from "../components/PlanningHistoryButton";
import { PLANNING_APPROVE_ROLES, RISK_FACTORS } from "../constants/planning";
import { closeAudit, getActiveAudits, getPlanningAudits, startAudit } from "../services/planningService";
import "./Planning.css";

const riskFor = (likelihood, impact) => {
  const score = likelihood * impact;
  return score <= 2 ? "Bajo" : score <= 4 ? "Medio" : "Alto";
};

function AuditoriasActivas() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canManage = PLANNING_APPROVE_ROLES.includes(user?.role);
  const [activeAudits, setActiveAudits] = useState([]);
  const [approvedAudits, setApprovedAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [active, proposals] = await Promise.all([getActiveAudits(), getPlanningAudits()]);
      setActiveAudits(active);
      setApprovedAudits(proposals.filter((item) => item.status === "APPROVED"));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getActiveAudits(), getPlanningAudits()])
      .then(([active, proposals]) => {
        if (cancelled) return;
        setActiveAudits(active);
        setApprovedAudits(proposals.filter((item) => item.status === "APPROVED"));
        setError("");
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const runTransition = async (id, action, successMessage) => {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await action(id);
      await refresh();
      setMessage(successMessage);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyId(null);
    }
  };

  const factorLabel = (value) => RISK_FACTORS.find((factor) => factor.value === value)?.label || "Media";
  const matrixCount = (likelihood, impact) => activeAudits.filter(
    (audit) => (audit.likelihood ?? 2) === likelihood && (audit.impact ?? 2) === impact
  ).length;

  return (
    <div className="dashboard-layout">
      <Sidebar active="auditorias-activas" />
      <main className="dashboard-main">
        <section className="dashboard-content planning-page clean-header-page active-audits-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">EJECUCIÓN Y RIESGO</span>
              <h1>Auditorías activas y matriz de riesgos</h1>
              <p>Consulta las auditorías en curso, su exposición y las decisiones de inicio o cierre.</p>
            </div>
            <button className="secondary-action" type="button" onClick={refresh} disabled={loading}>
              <RefreshCw size={16} aria-hidden="true" /> Actualizar
            </button>
          </div>

          {message && <p className="planning-message success" role="status">{message}</p>}
          {error && <p className="planning-message error" role="alert">{error}</p>}

          <div className="planning-summary">
            <div><strong>{activeAudits.length}</strong><span>Auditorías en curso</span></div>
            <div><strong>{approvedAudits.length}</strong><span>Aprobadas por iniciar</span></div>
            <div><strong>{activeAudits.filter((audit) => riskFor(audit.likelihood ?? 2, audit.impact ?? 2) === "Alto").length}</strong><span>Riesgo alto en curso</span></div>
          </div>

          <section className="risk-matrix-panel" aria-labelledby="risk-matrix-title">
            <div className="planning-section-heading">
              <div>
                <span className="eyebrow">MATRIZ 3 × 3</span>
                <h2 id="risk-matrix-title">Probabilidad e impacto de auditorías en curso</h2>
              </div>
              <span>Clasificación = probabilidad × impacto</span>
            </div>
            {loading ? <div className="planning-empty">Cargando matriz de riesgos...</div> : (
              <div className="risk-matrix-scroll">
                <table className="risk-matrix">
                  <caption>Conteo de auditorías activas por nivel de probabilidad e impacto</caption>
                  <thead>
                    <tr>
                      <th scope="col">Probabilidad ↓ / Impacto →</th>
                      {RISK_FACTORS.map((factor) => <th scope="col" key={factor.value}>{factor.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[...RISK_FACTORS].reverse().map((likelihood) => (
                      <tr key={likelihood.value}>
                        <th scope="row">{likelihood.label}</th>
                        {RISK_FACTORS.map((impact) => {
                          const risk = riskFor(likelihood.value, impact.value);
                          return (
                            <td className={`matrix-cell matrix-${risk.toLowerCase()}`} key={impact.value}>
                              <strong>{matrixCount(likelihood.value, impact.value)}</strong>
                              <span>{risk}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="risk-matrix-legend">Bajo: puntuación 1–2 · Medio: 3–4 · Alto: 6–9. El producto se calcula con niveles de 1 (bajo) a 3 (alto).</p>
          </section>

          <div className="planning-section-heading active-list-heading">
            <div><span className="eyebrow">SEGUIMIENTO</span><h2>En curso</h2></div>
            <span>{activeAudits.length} activas</span>
          </div>
          {loading ? <div className="planning-empty">Cargando auditorías...</div> : activeAudits.length === 0 ? (
            <div className="planning-empty"><Activity size={20} aria-hidden="true" />No hay auditorías en curso.</div>
          ) : (
            <div className="planning-list">
              {activeAudits.map((audit) => (
                <article className="planning-card active-audit-card" key={audit.id}>
                  <div className="planning-card-icon"><Activity size={21} aria-hidden="true" /></div>
                  <div className="planning-card-content">
                    <div className="proposal-heading">
                      <span className="planning-id">{audit.id}</span>
                      <span className={`risk-badge risk-${riskFor(audit.likelihood ?? 2, audit.impact ?? 2).toLowerCase()}`}>
                        Riesgo {riskFor(audit.likelihood ?? 2, audit.impact ?? 2)}
                      </span>
                    </div>
                    <h2>{audit.title}</h2>
                    <p>{audit.objective}</p>
                    <div className="proposal-meta">
                      <span><b>Área:</b> {audit.area}</span>
                      <span><b>Responsable:</b> {audit.responsible || "Sin asignar"}</span>
                      <span><b>Inicio:</b> {audit.startedAt ? new Date(audit.startedAt).toLocaleDateString("es-MX") : "Sin dato"}</span>
                      <span><b>Probabilidad / impacto:</b> {factorLabel(audit.likelihood ?? 2)} / {factorLabel(audit.impact ?? 2)}</span>
                    </div>
                  </div>
                  <div className="planning-card-actions">
                    {canManage && <button type="button" onClick={() => runTransition(audit.id, closeAudit, "Auditoría cerrada.")} disabled={busyId === audit.id}>
                      <CheckCircle2 size={16} aria-hidden="true" />{busyId === audit.id ? "Guardando..." : "Cerrar auditoría"}
                    </button>}
                    <PlanningHistoryButton proposal={audit} />
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="planning-section-heading active-list-heading">
            <div><span className="eyebrow">LISTAS PARA EJECUCIÓN</span><h2>Aprobadas pendientes de inicio</h2></div>
            <span>{approvedAudits.length} aprobadas</span>
          </div>
          {approvedAudits.length === 0 ? (
            <div className="planning-empty">No hay auditorías aprobadas pendientes de inicio.</div>
          ) : (
            <div className="planning-list">
              {approvedAudits.map((audit) => (
                <article className="planning-card active-audit-card" key={audit.id}>
                  <div className="planning-card-icon"><CheckCircle2 size={21} aria-hidden="true" /></div>
                  <div className="planning-card-content">
                    <span className="planning-id">{audit.id} · {audit.quarter} {audit.year}</span>
                    <h2>{audit.title}</h2>
                    <p>{audit.area} · Riesgo {riskFor(audit.likelihood ?? 2, audit.impact ?? 2)}</p>
                  </div>
                  <div className="planning-card-actions">
                    {canManage && <button type="button" onClick={() => runTransition(audit.id, startAudit, "Auditoría iniciada y visible en la matriz.")} disabled={busyId === audit.id}>
                      <Play size={16} aria-hidden="true" />{busyId === audit.id ? "Guardando..." : "Iniciar auditoría"}
                    </button>}
                    <PlanningHistoryButton proposal={audit} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuditoriasActivas;
