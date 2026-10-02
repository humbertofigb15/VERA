import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getAuditLog } from "../services/auditService";
import { ROLE_LABELS } from "../constants/roles";
import "./Dashboard.css";
import "./Usuarios.css";
import "./Auditoria.css";

const ACTION_LABELS = {
  LOGIN_SUCCESS: "Inicio de sesión",
  LOGIN_FAILED: "Intento de acceso fallido",
  LOGIN_BLOCKED: "Acceso bloqueado (cuenta no activa)",
  TWO_FACTOR_FAILED: "Código 2FA incorrecto",
  TWO_FACTOR_ENABLED: "2FA activado",
  ACCOUNT_REQUESTED: "Solicitud de cuenta",
  REQUEST_APPROVED: "Solicitud aprobada",
  REQUEST_REJECTED: "Solicitud rechazada",
  ROLE_CHANGED: "Cambio de rol",
  USER_ENABLED: "Cuenta habilitada",
  USER_DISABLED: "Cuenta deshabilitada"
};

const WARNING_ACTIONS = [
  "LOGIN_FAILED",
  "LOGIN_BLOCKED",
  "TWO_FACTOR_FAILED",
  "USER_DISABLED",
  "REQUEST_REJECTED"
];

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

const describe = ({ action, target, details }) => {
  const who = target?.username;
  switch (action) {
    case "ROLE_CHANGED":
      return `${who}: ${ROLE_LABELS[details.from] || details.from} → ${ROLE_LABELS[details.to] || details.to}`;
    case "REQUEST_APPROVED":
      return `${who} como ${ROLE_LABELS[details.role] || details.role}`;
    case "REQUEST_REJECTED":
    case "USER_ENABLED":
    case "USER_DISABLED":
    case "ACCOUNT_REQUESTED":
      return who || "";
    case "LOGIN_FAILED":
    case "TWO_FACTOR_FAILED":
      return details.ip ? `IP ${details.ip}` : "";
    case "LOGIN_SUCCESS":
      return details.method === "PASSWORD_2FA" ? "Contraseña + 2FA" : "Contraseña";
    default:
      return "";
  }
};

function Auditoria() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Pequeña espera al escribir para no pedir el registro en cada tecla.
    const timer = setTimeout(() => {
      setLoading(true);
      getAuditLog({ action, actor })
        .then((data) => {
          if (cancelled) return;
          setEntries(data);
          setError("");
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [action, actor]);

  return (
    <div className="dashboard-layout">
      <Sidebar active="auditoria" />

      <main className="dashboard-main">
        <div className="topbar">
          <div></div>
        </div>

        <section className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">GOBIERNO DE ACCESOS</span>
              <h1>Registro de actividad</h1>
              <p>Qué hizo cada usuario en VERA, del evento más reciente al más antiguo.</p>
            </div>
          </div>

          <div className="users-card">
            <div className="audit-filters">
              <input
                type="search"
                placeholder="Buscar por usuario..."
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                aria-label="Buscar por usuario"
              />
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                aria-label="Filtrar por acción"
              >
                <option value="">Todas las acciones</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="users-msg error">{error}</p>}
            {loading && !entries.length && <p className="users-muted">Cargando registro...</p>}

            {!loading && !error && entries.length === 0 && (
              <div className="users-empty">
                <Inbox size={20} strokeWidth={1.75} aria-hidden="true" />
                No hay actividad registrada con esos filtros.
              </div>
            )}

            {entries.length > 0 && (
              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Acción</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td className="nowrap">{formatDateTime(e.date)}</td>
                        <td>{e.actor.username || "—"}</td>
                        <td>{ROLE_LABELS[e.actor.role] || e.actor.role || "—"}</td>
                        <td>
                          <span
                            className={`audit-tag${WARNING_ACTIONS.includes(e.action) ? " warn" : ""}`}
                          >
                            {ACTION_LABELS[e.action] || e.action}
                          </span>
                        </td>
                        <td>{describe(e)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Auditoria;
