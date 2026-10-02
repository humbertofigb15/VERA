// Debe coincidir con backend/config/accountRules.js

export const USER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED"
};

export const INSTITUTIONAL_DOMAINS = ["vera.local"];

// RNF-17: reglas de contraseña, para mostrarlas mientras la persona escribe.
export const PASSWORD_CHECKS = [
  { label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Una mayúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Una minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "Un número", test: (p) => /[0-9]/.test(p) }
];