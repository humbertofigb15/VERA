const API_URL = "http://localhost:3000/api/auth";

export const verify2FA = async (tempToken, code) => {
  const response = await fetch(`${API_URL}/verify-2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken, code })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Código incorrecto");
  return data;
};

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  return data;
};