import { useState } from "react";
import { Check, ClipboardList } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { approvePlanningAudit, getPlanningAudits } from "../services/planningService";
import "./Planning.css";

const QUARTERS = [
  { value: "Q1", label: "Trimestre 1 (Enero - Abril)" },
  { value: "Q2", label: "Trimestre 2 (Mayo - Agosto)" },
  { value: "Q3", label: "Trimestre 3 (Septiembre - Diciembre)" },
];

function Planificacion() {
  const [items, setItems] = useState(() => getPlanningAudits());
  const [quarters, setQuarters] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const pendingItems = items.filter((item) => item.status !== "APPROVED");

  const handleApprove = (id) => {
    try {
      const updatedItems = approvePlanningAudit(id, quarters[id]);
      setItems(updatedItems);
      setMessage("La auditoría fue aprobada y ahora aparece en Trimestres.");
      setError("");
    } catch (approvalError) {
      setError(approvalError.message);
      setMessage("");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar active="planificacion" />
      <main className="dashboard-main">
        <div className="topbar"><div /></div>
        <section className="dashboard-content planning-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">GESTIÓN DEL PORTAFOLIO</span>
              <h1>Planificación</h1>
              <p>Revisa las auditorías y asígnalas a un trimestre.</p>
            </div>
          </div>

          {message && <p className="planning-message success">{message}</p>}
          {error && <p className="planning-message error">{error}</p>}

          {pendingItems.length === 0 ? (
            <div className="planning-empty">
              <Check size={22} aria-hidden="true" />
              Todas las auditorías fueron aprobadas y asignadas a un trimestre.
            </div>
          ) : (
            <div className="planning-list">
              {pendingItems.map((item) => (
                <article className="planning-card" key={item.id}>
                  <div className="planning-card-icon"><ClipboardList size={22} /></div>
                  <div className="planning-card-content">
                    <span className="planning-id">{item.id}</span>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                  <div className="planning-card-actions">
                    <label htmlFor={`quarter-${item.id}`}>Asignar trimestre</label>
                    <select
                      id={`quarter-${item.id}`}
                      value={quarters[item.id] || ""}
                      onChange={(event) =>
                        setQuarters({ ...quarters, [item.id]: event.target.value })
                      }
                    >
                      <option value="">Selecciona...</option>
                      {QUARTERS.map((quarter) => (
                        <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleApprove(item.id)}>
                      <Check size={17} aria-hidden="true" />
                      Aprobar auditoría
                    </button>
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

export default Planificacion;
