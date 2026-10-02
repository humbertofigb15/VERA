// Reglas de cuentas de VERA (HU-01): estados, correo institucional y contraseñas.

const USER_STATUS = {
  PENDING: "PENDING",   // se registró y espera aprobación del Super Admin
  ACTIVE: "ACTIVE",     // puede iniciar sesión
  DISABLED: "DISABLED"  // un administrador la deshabilitó
};

// RF-01: dominios de correo institucional aceptados al registrarse.
// Cuando el equipo defina el dominio real (por ejemplo "femsa.com"), se agrega aquí.
const INSTITUTIONAL_DOMAINS = ["vera.local"];

const isInstitutionalEmail = (email) => {
  const domain = String(email || "").toLowerCase().split("@")[1];
  return INSTITUTIONAL_DOMAINS.includes(domain);
};

// RNF-17: mínimo 8 caracteres, con mayúsculas, minúsculas y números.
const PASSWORD_RULE_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.";

const isValidPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

module.exports = {
  USER_STATUS,
  INSTITUTIONAL_DOMAINS,
  isInstitutionalEmail,
  PASSWORD_RULE_MESSAGE,
  isValidPassword
};
