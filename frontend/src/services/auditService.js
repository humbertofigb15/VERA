const API_URL = "/api/audit";

export const getAuditLog = async ({ action, actor, limit } = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  if (actor) params.set("actor", actor);
  if (limit) params.set("limit", limit);

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cargar el registro.");
  }

  return data.entries;
};
