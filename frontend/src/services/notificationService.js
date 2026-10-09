const request = async () => {
  const response = await fetch("/api/notifications", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo cargar la bandeja.");
  return data;
};

export const getNotifications = request;
