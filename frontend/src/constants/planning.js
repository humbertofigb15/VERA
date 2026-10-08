export const QUARTERS = [
  { value: "Q1", label: "Trimestre 1", period: "Enero - Marzo" },
  { value: "Q2", label: "Trimestre 2", period: "Abril - Junio" },
  { value: "Q3", label: "Trimestre 3", period: "Julio - Septiembre" },
  { value: "Q4", label: "Trimestre 4", period: "Octubre - Diciembre" }
];

export const AUDIT_TYPES = ["Interna", "Externa"];
export const RISK_LEVELS = ["Bajo", "Medio", "Alto"];

// Debe coincidir con PLANNING_CREATE_ROLES / PLANNING_APPROVE_ROLES del backend.
export const PLANNING_CREATE_ROLES = ["SUPER_ADMIN", "DIRECTOR", "GERENTE"];
export const PLANNING_APPROVE_ROLES = ["SUPER_ADMIN", "DIRECTOR"];
