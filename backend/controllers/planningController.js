const planningRepository = require("../repositories/planningRepository");
const userRepository = require("../repositories/userRepository");
const { logActivity } = require("../services/auditLogger");
const { ROLES } = require("../config/roles");
const { USER_STATUS } = require("../config/accountRules");

const TYPES = ["Interna", "Externa"];
const RISKS = ["Bajo", "Medio", "Alto"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const MIN_YEAR = 2020;
const MAX_YEAR = 2100;

const DUPLICATE_MESSAGE = "Ya existe una propuesta con el mismo título, área y año.";
const isTerminal = (proposal) => proposal.status === "APPROVED" || proposal.status === "REJECTED";

const text = (value) => String(value ?? "").trim();
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const activeAuditors = () =>
  userRepository
    .getAll()
    .filter((u) => u.role === ROLES.AUDITOR && u.status === USER_STATUS.ACTIVE)
    .map((u) => ({ id: u.id, name: u.name, username: u.username }));

// Valida y limpia el cuerpo de una propuesta. Regresa { error } o { data }.
const parseProposal = (body) => {
  const title = text(body.title);
  const objective = text(body.objective);
  const area = text(body.area);
  const type = text(body.type) || "Interna";
  const risk = text(body.risk) || "Medio";
  const quarter = text(body.quarter);
  const year = Number(body.year) || new Date().getFullYear();
  const startDate = text(body.startDate);
  const endDate = text(body.endDate);

  if (!title || !objective || !area) {
    return { error: "Completa el título, el área y el objetivo de la propuesta." };
  }
  if (!TYPES.includes(type)) return { error: "El tipo de auditoría no es válido." };
  if (!RISKS.includes(risk)) return { error: "El nivel de riesgo no es válido." };
  if (quarter && !QUARTERS.includes(quarter)) return { error: "El trimestre no es válido." };
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: "El año no es válido." };
  }
  if ((startDate && !isDate(startDate)) || (endDate && !isDate(endDate))) {
    return { error: "Las fechas no tienen un formato válido." };
  }
  if (startDate && endDate && endDate < startDate) {
    return { error: "La fecha de fin no puede ser anterior a la de inicio." };
  }

  let responsibleId = null;
  let responsible = "Sin asignar";
  const rawResponsible = body.responsibleId;
  if (rawResponsible !== undefined && rawResponsible !== null && rawResponsible !== "") {
    const auditor = activeAuditors().find((a) => a.id === Number(rawResponsible));
    if (!auditor) return { error: "El responsable debe ser un auditor activo." };
    responsibleId = auditor.id;
    responsible = auditor.name;
  }

  return {
    data: { title, objective, area, type, risk, quarter, year, startDate, endDate, responsibleId, responsible }
  };
};

// GET /api/planning
const listProposals = (req, res) => {
  res.json({ proposals: planningRepository.getAll() });
};

// GET /api/planning/auditors
const listAuditors = (req, res) => {
  res.json({ auditors: activeAuditors() });
};

// POST /api/planning
const createProposal = (req, res) => {
  const { data, error } = parseProposal(req.body);
  if (error) return res.status(400).json({ message: error });

  if (planningRepository.findDuplicate(data)) {
    return res.status(409).json({ message: DUPLICATE_MESSAGE });
  }

  const proposal = planningRepository.create({
    ...data,
    createdBy: { id: req.user.id, name: req.user.username }
  });

  logActivity({
    actor: req.user,
    action: "AUDIT_PROPOSAL_CREATED",
    details: { proposalId: proposal.id, title: proposal.title }
  });

  res.status(201).json({ proposal });
};

// PUT /api/planning/:id  (solo propuestas abiertas)
const updateProposal = (req, res) => {
  const current = planningRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Propuesta no encontrada." });
  if (isTerminal(current)) {
    return res.status(409).json({ message: "Una propuesta resuelta ya no se puede editar." });
  }

  const { data, error } = parseProposal(req.body);
  if (error) return res.status(400).json({ message: error });

  if (planningRepository.findDuplicate(data, current.id)) {
    return res.status(409).json({ message: DUPLICATE_MESSAGE });
  }

  const proposal = planningRepository.update(current.id, data);

  logActivity({
    actor: req.user,
    action: "AUDIT_PROPOSAL_UPDATED",
    details: { proposalId: proposal.id, title: proposal.title }
  });

  res.json({ proposal });
};

// POST /api/planning/:id/approve
const approveProposal = (req, res) => {
  const current = planningRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Propuesta no encontrada." });
  if (isTerminal(current)) {
    return res.status(409).json({ message: "Esta propuesta ya fue resuelta." });
  }

  const quarter = text(req.body.quarter) || current.quarter;
  if (!QUARTERS.includes(quarter)) {
    return res.status(400).json({ message: "Selecciona un trimestre para completar la aprobación." });
  }

  const proposal = planningRepository.approve(current.id, {
    quarter,
    approvedBy: { id: req.user.id, name: req.user.username }
  });

  logActivity({
    actor: req.user,
    action: "AUDIT_PROPOSAL_APPROVED",
    details: { proposalId: proposal.id, title: proposal.title, quarter }
  });

  res.json({ proposal });
};

// POST /api/planning/:id/reject
const rejectProposal = (req, res) => {
  const current = planningRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Propuesta no encontrada." });
  if (isTerminal(current)) {
    return res.status(409).json({ message: "Esta propuesta ya fue resuelta." });
  }

  const rejectionReason = text(req.body.reason);
  if (!rejectionReason) {
    return res.status(400).json({ message: "Escribe el motivo del rechazo." });
  }

  const proposal = planningRepository.reject(current.id, {
    rejectionReason,
    rejectedBy: { id: req.user.id, name: req.user.username }
  });

  logActivity({
    actor: req.user,
    action: "AUDIT_PROPOSAL_REJECTED",
    details: { proposalId: proposal.id, title: proposal.title, reason: rejectionReason }
  });

  res.json({ proposal });
};

// DELETE /api/planning/:id  (solo propuestas abiertas)
const deleteProposal = (req, res) => {
  const current = planningRepository.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Propuesta no encontrada." });
  if (isTerminal(current)) {
    return res.status(409).json({ message: "Una propuesta resuelta ya no se puede eliminar." });
  }

  planningRepository.remove(current.id);

  logActivity({
    actor: req.user,
    action: "AUDIT_PROPOSAL_DELETED",
    details: { proposalId: current.id, title: current.title }
  });

  res.json({ message: "Propuesta eliminada." });
};

module.exports = {
  parseProposal,
  listProposals,
  listAuditors,
  createProposal,
  updateProposal,
  approveProposal,
  rejectProposal,
  deleteProposal
};
