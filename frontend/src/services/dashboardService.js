export const getDashboardSummary = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo cargar el panel.");
  return data;
};
