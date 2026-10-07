import { useState } from "react";
import { Check, ClipboardList, Plus, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  approveAuditProposal,
  createAuditProposal,
  getPlanningAudits
} from "../services/planningService";
import "./Planning.css";

const QUARTERS = [
  { value: "Q1", label: "Trimestre 1 (Enero - Abril)" },
  { value: "Q2", label: "Trimestre 2 (Mayo - Agosto)" },
  { value: "Q3", label: "Trimestre 3 (Septiembre - Diciembre)" }
];

const EMPTY_FORM = {
  title: "",
  area: "",
  responsible: "",
  risk: "Medio",
  quarter: "",
  objective: ""
};

function Planificacion() {
  const [items, setItems] = useState(() => getPlanningAudits());
  const [quarters, setQuarters] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openProposals = items.filter((item) => item.status !== "APPROVED");
  const approvedProposals = items.filter((item) => item.status === "APPROVED");

  const updateForm = (field, value) => setForm({ ...form, [field]: value });

  const handleCreate = (event) => {
    event.preventDefault();
    try {
      setItems(createAuditProposal(form));
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
      setMessage("La propuesta fue creada y quedó abierta para revisión.");
      setError("");
    } catch (creationError) {
      setError(creationError.message);
    }
  };

  const handleApprove = (id) => {
    try {
      setItems(approveAuditProposal(id, quarters[id]));
      setMessage("La propuesta alcanzó el 100% y ahora aparece en Trimestres.");
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
        <section className="dashboard-content planning-page clean-header-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">GESTIÓN DEL PORTAFOLIO</span>
              <h1>Planificación</h1>
              <p>Propón auditorías y da seguimiento a su aprobación.</p>
            </div>
            <button className="primary-action" type="button" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              Nueva propuesta
            </button>
          </div>

          {message && <p className="planning-message success">{message}</p>}
          {error && <p className="planning-message error">{error}</p>}

          <div className="planning-summary">
            <div><strong>{openProposals.length}</strong><span>Propuestas abiertas</span></div>
            <div><strong>{approvedProposals.length}</strong><span>Auditorías aprobadas</span></div>
            <div><strong>{items.length}</strong><span>Total del tablero</span></div>
          </div>

          <div className="planning-section-heading">
            <div>
              <span className="eyebrow">TABLERO DE PROPUESTAS</span>
              <h2>Propuestas abiertas</h2>
            </div>
            <span>{openProposals.length} pendientes</span>
          </div>

          {openProposals.length === 0 ? (
            <div className="planning-empty">
              <Check size={22} aria-hidden="true" />
              No hay propuestas abiertas en este momento.
            </div>
          ) : (
            <div className="planning-list">
              {openProposals.map((item) => (
                <article className="planning-card" key={item.id}>
                  <div className="planning-card-icon"><ClipboardList size={22} /></div>
                  <div className="planning-card-content">
                    <div className="proposal-heading">
                      <span className="planning-id">{item.id}</span>
                      <span className={`risk-badge risk-${item.risk.toLowerCase()}`}>{item.risk}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <div className="proposal-meta">
                      <span><b>Área:</b> {item.area || "Sin definir"}</span>
                      <span><b>Responsable:</b> {item.responsible || "Sin asignar"}</span>
                    </div>
                    <div className="approval-progress">
                      <div><span>Aprobación</span><b>{item.approval || 0}%</b></div>
                      <div className="progress-track"><span style={{ width: `${item.approval || 0}%` }} /></div>
                    </div>
                  </div>
                  <div className="planning-card-actions">
                    <label htmlFor={`quarter-${item.id}`}>Trimestre estimado</label>
                    <select
                      id={`quarter-${item.id}`}
                      value={quarters[item.id] || item.quarter || ""}
                      onChange={(event) => setQuarters({ ...quarters, [item.id]: event.target.value })}
                    >
                      <option value="">Sin definir</option>
                      {QUARTERS.map((quarter) => (
                        <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleApprove(item.id)}>
                      <Check size={17} aria-hidden="true" />
                      Marcar 100% aprobada
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {isModalOpen && (
            <div className="modal-backdrop">
              <form className="proposal-modal" onSubmit={handleCreate}>
                <div className="modal-header">
                  <div>
                    <span className="eyebrow">NUEVA AUDITORÍA</span>
                    <h2>Abrir una propuesta</h2>
                    <p>Captura el contexto para que el comité pueda revisarla.</p>
                  </div>
                  <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="Cerrar">
                    <X size={20} />
                  </button>
                </div>
                <div className="proposal-form-grid">
                  <label className="full-width">Título de la propuesta
                    <input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Revisión de controles de acceso" />
                  </label>
                  <label>Unidad o área
                    <input required value={form.area} onChange={(event) => updateForm("area", event.target.value)} placeholder="Operaciones" />
                  </label>
                  <label>Responsable
                    <input required value={form.responsible} onChange={(event) => updateForm("responsible", event.target.value)} placeholder="Nombre del responsable" />
                  </label>
                  <label>Tipo de auditoría
                    <select defaultValue="Interna"><option>Interna</option><option>Externa</option></select>
                  </label>
                  <label>Nivel de riesgo
                    <select value={form.risk} onChange={(event) => updateForm("risk", event.target.value)}>
                      <option>Bajo</option><option>Medio</option><option>Alto</option>
                    </select>
                  </label>
                  <label>Trimestre estimado
                    <select value={form.quarter} onChange={(event) => updateForm("quarter", event.target.value)}>
                      <option value="">Sin definir</option>
                      {QUARTERS.map((quarter) => <option key={quarter.value} value={quarter.value}>{quarter.label}</option>)}
                    </select>
                  </label>
                  <label>Año
                    <input value="2026" readOnly />
                  </label>
                  <label className="full-width">Objetivo
                    <textarea required value={form.objective} onChange={(event) => updateForm("objective", event.target.value)} placeholder="¿Qué decisión o riesgo busca aclarar esta auditoría?" />
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-action" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="primary-action">Abrir propuesta</button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Planificacion;
