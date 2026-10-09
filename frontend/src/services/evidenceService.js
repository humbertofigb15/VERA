const API_URL = "/api/evidence";

const request = async (path = "", options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo completar la acción.");
  return data;
};

export const getEvidence = async (filters = {}) => {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return (await request(`/?${query}`)).evidence;
};
export const createEvidence = async (evidence) => (await request("/", { method: "POST", body: JSON.stringify(evidence) })).evidence;
