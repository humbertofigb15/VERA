import { useEffect, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, ClipboardList, RotateCw, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getDashboardSummary } from "../services/dashboardService";
import "./Dashboard.css";

const STATUS_LABELS = {
  OPEN: "Pendiente de decisión",
  APPROVED: "Aprobada para iniciar",
  ACTIVE: "En curso",
  CLOSED: "Cerrada",
  REJECTED: "Rechazada"
};

const RISK_LABELS = { 1: "Baja", 2: "Media", 3: "Alta" };

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setSummary(await getDashboardSummary());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary()
      .then((data) => { if (!cancelled) setSummary(data); })
      .catch((loadError) => { if (!cancelled) setError(loadError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const metrics = summary?.metrics;
  const maxStatusCount = Math.max(1, ...(summary?.statusCounts || []).map((item) => item.count));
  const riskCells = summary?.riskMatrix || [];

  return (
    <div className="dashboard-layout">
      <Sidebar active="dashboard" />
      <main className="dashboard-main">
        <section className="dashboard-content role-dashboard">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">PANEL PRINCIPAL · {summary?.scopeLabel || "CARGANDO"}</span>
              <h1>{summary?.title || "Panel de auditorías"}</h1>
              <p>{summary?.description || "Resumen actualizado del portafolio y sus prioridades."}</p>
            </div>
            <button className="dashboard-refresh" type="button" onClick={load} disabled={loading}>
              <RotateCw size={16} aria-hidden="true" /> Actualizar
            </button>
          </div>

          {error && (
            <div className="dashboard-alert" role="alert">
              <span>{error}</span>
              <button type="button" onClick={load}>Reintentar</button>
            </div>
          )}

          {loading && !summary ? (
            <div className="dashboard-loading" role="status">Cargando indicadores del portafolio...</div>
          ) : summary && (
            <>
              <div className="kpi-grid">
                <article className="kpi-card">
                  <span className="kpi-label">AUDITORÍAS VISIBLES</span>
                  <div className="kpi-row"><div><strong>{metrics.total}</strong><p>{summary.scopeLabel}</p></div><div className="kpi-icon"><ClipboardList size={22} /></div></div>
                </article>
                <article className="kpi-card">
                  <span className="kpi-label">PENDIENTES DE DECISIÓN</span>
                  <div className="kpi-row"><div><strong>{metrics.pending}</strong><p>Propuestas abiertas</p></div><div className="kpi-icon warning"><ShieldAlert size={22} /></div></div>
                </article>
                <article className="kpi-card">
                  <span className="kpi-label">AUDITORÍAS EN CURSO</span>
                  <div className="kpi-row"><div><strong>{metrics.active}</strong><p>Actualmente activas</p></div><div className="kpi-icon green"><Activity size={22} /></div></div>
                </article>
                <article className="kpi-card">
                  <span className="kpi-label">RIESGO ALTO</span>
                  <div className="kpi-row"><div><strong>{metrics.highRisk}</strong><p>Propuestas y auditorías visibles</p></div><div className="kpi-icon warning"><ShieldAlert size={22} /></div></div>
                </article>
              </div>

              <div className="dashboard-insight-row">
                <section className="dashboard-panel status-chart-panel" aria-labelledby="status-chart-title">
                  <div className="dashboard-panel-heading">
                    <div><span className="eyebrow">ESTADO DEL PORTAFOLIO</span><h2 id="status-chart-title">Auditorías por estado</h2></div>
                    <span>{metrics.total} en total</span>
                  </div>
                  <div className="status-chart" role="list">
                    {summary.statusCounts.map(({ status, count }) => (
                      <div className="status-chart-row" role="listitem" key={status}>
                        <span>{STATUS_LABELS[status]}</span>
                        <div className="status-chart-track" role="img" aria-label={`${count} ${STATUS_LABELS[status]}`}>
                          <span className={`status-chart-bar bar-${status.toLowerCase()}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="dashboard-progress-summary">
                    <span>Avance medio de auditorías iniciadas</span><strong>{metrics.averageProgress}%</strong>
                    <div className="progress-track"><span style={{ width: `${metrics.averageProgress}%` }} /></div>
                  </div>
                </section>

                <section className="dashboard-panel dashboard-risk-panel" aria-labelledby="dashboard-risk-title">
                  <div className="dashboard-panel-heading">
                    <div><span className="eyebrow">RIESGO EN EJECUCIÓN</span><h2 id="dashboard-risk-title">Matriz probabilidad × impacto</h2></div>
                    <Link to="/auditorias-activas">Abrir matriz <ArrowRight size={15} /></Link>
                  </div>
                  <div className="dashboard-risk-matrix">
                    <div className="risk-axis-label">Probabilidad</div>
                    <div className="risk-matrix-body">
                      {[...riskCells].reverse().map((row) => (
                        <div className="risk-matrix-row" key={row[0]?.likelihood}>
                          <span className="risk-row-label">{RISK_LABELS[row[0]?.likelihood]}</span>
                          {row.map((cell) => (
                            <div className={`dashboard-risk-cell cell-${cell.risk.toLowerCase()}`} key={`${cell.likelihood}-${cell.impact}`} title={`Probabilidad ${RISK_LABELS[cell.likelihood]}, impacto ${RISK_LABELS[cell.impact]}: ${cell.count}`}>
                              <strong>{cell.count}</strong><span>{cell.risk}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div className="risk-column-labels"><span>Impacto</span>{[1, 2, 3].map((level) => <span key={level}>{RISK_LABELS[level]}</span>)}</div>
                    </div>
                  </div>
                  <p className="dashboard-chart-note">Conteo de auditorías activas. Clasificación calculada con la regla de riesgo documentada.</p>
                </section>
              </div>

              <section className="dashboard-panel pending-panel" aria-labelledby="pending-title">
                <div className="dashboard-panel-heading">
                  <div><span className="eyebrow">SIGUIENTE ACCIÓN</span><h2 id="pending-title">{summary.permissions.canApprove ? "Propuestas pendientes de decisión" : summary.role === "AUDITOR" ? "Mis auditorías por atender" : "Actividades en seguimiento"}</h2></div>
                  <Link to={summary.role === "AUDITOR" ? "/auditorias-activas" : "/planificacion"}>Ver tablero <ArrowRight size={15} /></Link>
                </div>
                {summary.pendingItems.length === 0 ? (
                  <div className="dashboard-empty"><CheckCircle2 size={20} />No hay elementos pendientes en tu vista.</div>
                ) : (
                  <div className="dashboard-pending-list">
                    {summary.pendingItems.map((item) => (
                      <article className="dashboard-pending-item" key={item.id}>
                        <div className="pending-item-main">
                          <span className="planning-id">{item.id} · {STATUS_LABELS[item.status]}</span>
                          <h3>{item.title}</h3>
                          <p>{item.area}{item.quarter ? ` · ${item.quarter} ${item.year}` : ""}</p>
                        </div>
                        <span className={`risk-badge risk-${(item.risk || "Medio").toLowerCase()}`}>Riesgo {item.risk || "Medio"}</span>
                        <Link className="pending-open-link" to={summary.role === "AUDITOR" ? "/auditorias-activas" : "/planificacion"} aria-label={`Abrir ${item.title}`}><ArrowRight size={18} /></Link>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <nav className="dashboard-quick-actions" aria-label="Acciones rápidas">
                {summary.permissions.canCreate && <Link to="/planificacion"><ClipboardList size={17} />Nueva propuesta</Link>}
                {summary.permissions.canApprove && <Link to="/planificacion"><CheckCircle2 size={17} />Revisar propuestas</Link>}
                <Link to="/auditorias-activas"><Activity size={17} />Auditorías activas y riesgos</Link>
                <Link to="/trimestres"><ArrowRight size={17} />Plan trimestral</Link>
              </nav>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
