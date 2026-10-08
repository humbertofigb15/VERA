import { ArrowLeft, ArrowRight, CalendarRange, CheckCircle2, Clock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getPlanningAudits } from "../services/planningService";
import { QUARTERS } from "../constants/planning";
import "./Planning.css";

function Trimestres() {
  const navigate = useNavigate();
  const [approvedAudits, setApprovedAudits] = useState([]);

  useEffect(() => {
    getPlanningAudits()
      .then((items) => setApprovedAudits(items.filter((item) => item.status === "APPROVED" && item.approval === 100)))
      .catch(() => setApprovedAudits([]));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar active="trimestres" />
      <main className="dashboard-main">
        <section className="dashboard-content planning-page trimestres-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">CALENDARIO DEL PORTAFOLIO</span>
              <h1>Trimestres</h1>
              <p>Auditorías aprobadas y asignadas al plan anual.</p>
            </div>
          </div>

          <div className="quarter-grid">
            {QUARTERS.map((quarter) => {
              const items = approvedAudits.filter((item) => item.quarter === quarter.value);
              const progress = items.length
                ? Math.round(items.reduce((total, item) => total + (item.progress ?? item.approval ?? 0), 0) / items.length)
                : 0;
              const closed = items.filter((item) => item.status === "CLOSED").length;
              return (
                <button
                  className="quarter-card quarter-card-button"
                  key={quarter.value}
                  type="button"
                  onClick={() => navigate(`/trimestres/${quarter.value}`)}
                >
                  <header>
                    <div className="quarter-icon"><CalendarRange size={20} /></div>
                    <div>
                      <h2>{quarter.label}</h2>
                      <p>{quarter.period}</p>
                    </div>
                    <span className="quarter-count">{items.length}</span>
                  </header>
                  <div className="quarter-card-footer">
                    {items.length ? (
                      <div className="quarter-progress">
                        <div className="quarter-progress-summary">
                          <span>{items.length} {items.length === 1 ? "auditoría" : "auditorías"}</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="quarter-progress-track">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <small>{closed} cerradas</small>
                      </div>
                    ) : (
                      <span>Sin auditorías programadas</span>
                    )}
                    <ArrowRight size={18} aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export function TrimestreDetalle() {
  const navigate = useNavigate();
  const { quarterId } = useParams();
  const quarter = QUARTERS.find((item) => item.value === quarterId) || QUARTERS[0];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos los estados");
  const [allAudits, setAllAudits] = useState([]);

  useEffect(() => {
    getPlanningAudits().then(setAllAudits).catch(() => setAllAudits([]));
  }, []);

  const audits = allAudits
    .filter((item) => item.status === "APPROVED" && item.approval === 100 && item.quarter === quarter.value)
    .filter((item) => {
      const matchesQuery = `${item.id} ${item.title} ${item.area} ${item.responsible}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesQuery && (status === "Todos los estados" || status === "Aprobada");
    });

  return (
    <div className="dashboard-layout">
      <Sidebar active="trimestres" />
      <main className="dashboard-main">
        <section className="dashboard-content planning-page trimestres-page workspace-page">
          <button className="back-link" type="button" onClick={() => navigate("/trimestres")}>
            <ArrowLeft size={17} /> Volver a trimestres
          </button>
          <div className="workspace-header">
            <div>
              <div className="workspace-kicker"><CalendarRange size={18} /> PLANEACIÓN TRIMESTRAL</div>
              <h1>Espacio de Trabajo {quarter.label.replace("Trimestre ", "T")}</h1>
              <p>Auditorías aprobadas y programadas durante {quarter.label}.</p>
            </div>
          </div>

          <div className="workspace-stats">
            <div><strong>{audits.length}</strong><span>Auditorías</span></div>
            <div><strong>{audits.length ? "100%" : "0%"}</strong><span>Progreso del trimestre</span></div>
            <div><strong>{audits.length ? audits.filter((item) => item.status === "CLOSED").length : 0}</strong><span>Cerradas</span></div>
          </div>

          <div className="filter-panel">
            <div>
              <h2>Filtrar auditorías</h2>
              <p>Busca por identificador, auditoría, área o responsable.</p>
            </div>
            <div className="filter-controls">
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Estado">
                <option>Todos los estados</option>
                <option>Aprobada</option>
              </select>
              <label className="search-input">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar auditoría..." />
              </label>
            </div>
          </div>

          <div className="audit-workspace-table">
            <div className="audit-table-heading">
              <span>ID</span><span>AUDITORÍA</span><span>UNIDAD / ÁREA</span><span>RESPONSABLE</span><span>ESTADO</span><span>AVANCE</span><span>ACCIÓN</span>
            </div>
            {audits.length === 0 ? (
              <div className="workspace-empty"><Clock size={22} /> No hay auditorías aprobadas en este trimestre.</div>
            ) : audits.map((audit) => (
              <div className="audit-table-row" key={audit.id}>
                <span className="planning-id">{audit.id}</span>
                <strong>{audit.title}</strong>
                <span>{audit.area}</span>
                <span>{audit.responsible}</span>
                <span className="status-pill"><CheckCircle2 size={14} /> Aprobada</span>
                <span className="audit-progress"><i /><b>100%</b></span>
                <button type="button" className="table-action">Abrir</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Trimestres;
