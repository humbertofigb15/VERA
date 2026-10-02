const API_URL = "http://localhost:3000/api/users";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la acción.");
  }

  return data;
};

export const getUsers = async () => {
  const data = await request("");
  return data.users;
};


export const updateUserRole = async (id, role) => {
  const data = await request(`/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
  return data.user;
};

export const updateUserStatus = async (id, active) => {
  const data = await request(`/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active })
  });
  return data.user;
};

// Solicitudes de registro (solo Super Admin)
export const approveRequest = async (id, role) => {
  const data = await request(`/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ role })
  });
  return data.user;
};

export const rejectRequest = async (id) => {
  const data = await request(`/${id}/reject`, { method: "POST" });
  return data.user;
};
