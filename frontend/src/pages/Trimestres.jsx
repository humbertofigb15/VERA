import { CalendarRange, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getPlanningAudits } from "../services/planningService";
import "./Planning.css";

const QUARTERS = [
  { value: "Q1", label: "Trimestre 1", period: "Enero - Abril" },
  { value: "Q2", label: "Trimestre 2", period: "Mayo - Agosto" },
  { value: "Q3", label: "Trimestre 3", period: "Septiembre - Diciembre" },
];

function Trimestres() {
  const approvedAudits = getPlanningAudits().filter((item) => item.status === "APPROVED");

  return (
    <div className="dashboard-layout">
      <Sidebar active="trimestres" />
      <main className="dashboard-main">
        <div className="topbar"><div /></div>
        <section className="dashboard-content planning-page">
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
              return (
                <section className="quarter-card" key={quarter.value}>
                  <header>
                    <div className="quarter-icon"><CalendarRange size={20} /></div>
                    <div>
                      <h2>{quarter.label}</h2>
                      <p>{quarter.period}</p>
                    </div>
                    <span className="quarter-count">{items.length}</span>
                  </header>
                  {items.length === 0 ? (
                    <p className="quarter-empty">No hay auditorías aprobadas en este trimestre.</p>
                  ) : (
                    <div className="quarter-items">
                      {items.map((item) => (
                        <article key={item.id}>
                          <div>
                            <span className="planning-id">{item.id}</span>
                            <h3>{item.title}</h3>
                          </div>
                          <CheckCircle2 size={18} aria-label="Auditoría aprobada" />
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Trimestres;
