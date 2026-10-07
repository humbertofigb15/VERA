const STORAGE_KEY = "vera-planning-audits";

const INITIAL_AUDITS = [
  {
    id: "AUD-01",
    title: "Auditoría de controles de acceso",
    description: "Revisión de usuarios, roles y permisos del portafolio.",
    status: "PENDING",
    quarter: ""
  },
  {
    id: "AUD-02",
    title: "Auditoría de gestión de riesgos",
    description: "Evaluación de riesgos, controles y planes de tratamiento.",
    status: "PENDING",
    quarter: ""
  },
  {
    id: "AUD-03",
    title: "Auditoría de seguimiento de hallazgos",
    description: "Validación del avance de los hallazgos abiertos y cerrados.",
    status: "PENDING",
    quarter: ""
  }
];

const readItems = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDITS));
    return INITIAL_AUDITS;
  }

  try {
    return JSON.parse(stored);
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

export const approvePlanningAudit = (id, quarter) => {
  if (!quarter) {
    throw new Error("Selecciona un trimestre antes de aprobar la auditoría.");
  }

  const items = readItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error("No se encontró la auditoría seleccionada.");
  }

  item.status = "APPROVED";
  item.quarter = quarter;
  return saveItems(items);
};
