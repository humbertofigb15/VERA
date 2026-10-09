// Propuestas de auditoría en memoria (igual que el resto de los datos del demo).
const seed = (id, title, objective, area, risk) => ({
  id,
  title,
  objective,
  type: "Interna",
  area,
  responsibleId: null,
  responsible: "Sin asignar",
  risk,
  year: 2026,
  quarter: "",
  startDate: "",
  endDate: "",
  status: "OPEN",
  approval: 0,
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectionReason: null
});

const proposals = [
  seed("AUD-01", "Auditoría de controles de acceso", "Revisión de usuarios, roles y permisos del portafolio.", "Tecnología", "Medio"),
  seed("AUD-02", "Auditoría de gestión de riesgos", "Evaluación de riesgos, controles y planes de tratamiento.", "Operaciones", "Alto"),
  seed("AUD-03", "Auditoría de seguimiento de hallazgos", "Validación del avance de los hallazgos abiertos y cerrados.", "Finanzas", "Medio")
];

const normalize = (value) => String(value || "").trim().toLowerCase();

const getAll = () => proposals.map((p) => ({ ...p }));

const findById = (id) => proposals.find((p) => p.id === id) || null;

const nextId = () => {
  const max = proposals.reduce((acc, p) => {
    const n = Number(String(p.id).replace("AUD-", ""));
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `AUD-${String(max + 1).padStart(2, "0")}`;
};

// Duplicada: mismo título, área y año (se ignora la propuesta indicada en excludeId).
const findDuplicate = ({ title, area, year }, excludeId = null) =>
  proposals.find(
    (p) =>
      p.id !== excludeId &&
      normalize(p.title) === normalize(title) &&
      normalize(p.area) === normalize(area) &&
      p.year === year
  ) || null;

const create = (data) => {
  const proposal = {
    ...data,
    id: nextId(),
    status: "OPEN",
    approval: 0,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null
  };
  proposals.unshift(proposal);
  return { ...proposal };
};

const update = (id, data) => {
  const proposal = findById(id);
  if (!proposal) return null;
  Object.assign(proposal, data, { updatedAt: new Date().toISOString() });
  return { ...proposal };
};

const approve = (id, { quarter, approvedBy }) => {
  const proposal = findById(id);
  if (!proposal) return null;
  Object.assign(proposal, {
    status: "APPROVED",
    approval: 100,
    quarter,
    approvedBy,
    approvedAt: new Date().toISOString()
  });
  return { ...proposal };
};

const reject = (id, { rejectionReason, rejectedBy }) => {
  const proposal = findById(id);
  if (!proposal) return null;
  Object.assign(proposal, {
    status: "REJECTED",
    rejectionReason,
    rejectedBy,
    rejectedAt: new Date().toISOString()
  });
  return { ...proposal };
};

const remove = (id) => {
  const index = proposals.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const [removed] = proposals.splice(index, 1);
  return removed;
};

module.exports = { getAll, findById, findDuplicate, create, update, approve, reject, remove };
