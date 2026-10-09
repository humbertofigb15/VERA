const API_URL = "/api/planning";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo cargar la actividad.");
  return data;
};

export const getPlanningHistory = async (id) => request(`/${id}/history`);
export const addPlanningComment = async (id, text) => (await request(`/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) })).comment;
