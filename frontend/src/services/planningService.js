const STORAGE_KEY = "vera-planning-audits";

const INITIAL_AUDITS = [
  {
    id: "AUD-01",
    title: "Auditoría de controles de acceso",
    description: "Revisión de usuarios, roles y permisos del portafolio.",
    status: "OPEN",
    approval: 0,
    area: "Tecnología",
    responsible: "Sin asignar",
    risk: "Medio",
    quarter: ""
  },
  {
    id: "AUD-02",
    title: "Auditoría de gestión de riesgos",
    description: "Evaluación de riesgos, controles y planes de tratamiento.",
    status: "OPEN",
    approval: 0,
    area: "Operaciones",
    responsible: "Sin asignar",
    risk: "Alto",
    quarter: ""
  },
  {
    id: "AUD-03",
    title: "Auditoría de seguimiento de hallazgos",
    description: "Validación del avance de los hallazgos abiertos y cerrados.",
    status: "OPEN",
    approval: 0,
    area: "Finanzas",
    responsible: "Sin asignar",
    risk: "Medio",
    quarter: ""
  }
];

const normalizeAudit = (item, index) => ({
  id: item.id || `AUD-${String(index + 1).padStart(2, "0")}`,
  title: item.title || "Auditoría sin título",
  description: item.description || "Sin objetivo registrado.",
  status: item.status === "APPROVED" ? "APPROVED" : "OPEN",
  approval: item.status === "APPROVED" ? 100 : Number(item.approval) || 0,
  area: item.area || "Sin definir",
  responsible: item.responsible || "Sin asignar",
  risk: ["Bajo", "Medio", "Alto"].includes(item.risk) ? item.risk : "Medio",
  quarter: ["Q1", "Q2", "Q3"].includes(item.quarter) ? item.quarter : ""
});

const readItems = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDITS));
    return INITIAL_AUDITS;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("El catálogo de auditorías no tiene un formato válido.");
    }

    const normalized = parsed.map(normalizeAudit);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDITS));
    return INITIAL_AUDITS;
  }
};

const saveItems = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const getPlanningAudits = () => readItems();

export const createAuditProposal = (proposal) => {
  const items = readItems();
  const nextNumber = items.reduce((max, item) => {
    const number = Number(String(item.id).replace("AUD-", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0) + 1;

  const audit = {
    id: `AUD-${String(nextNumber).padStart(2, "0")}`,
    title: proposal.title.trim(),
    description: proposal.objective.trim(),
    status: "OPEN",
    approval: 0,
    area: proposal.area.trim(),
    responsible: proposal.responsible.trim(),
    risk: proposal.risk,
    quarter: proposal.quarter
  };

  if (!audit.title || !audit.description || !audit.area || !audit.responsible) {
    throw new Error("Completa los campos obligatorios de la propuesta.");
  }

  return saveItems([audit, ...items]);
};

export const approveAuditProposal = (id, quarter) => {
  if (!quarter) {
    throw new Error("Selecciona un trimestre para completar la aprobación.");
  }

  const items = readItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error("No se encontró la auditoría seleccionada.");
  }

  item.status = "APPROVED";
  item.approval = 100;
  item.quarter = quarter;
  return saveItems(items);
};
