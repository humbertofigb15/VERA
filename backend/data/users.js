const users = [
  {
    id: 1,
    username: "superadmin",
    password: "vera123",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 2,
    username: "demo",
    password: "vera123",
    name: "Usuario Demo",
    role: "DIRECTOR",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 3,
    username: "gerente",
    password: "vera123",
    name: "Gerente Demo",
    role: "GERENTE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 4,
    username: "jefatura",
    password: "vera123",
    name: "Jefatura Demo",
    role: "JEFATURA",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 5,
    username: "auditor",
    password: "vera123",
    name: "Auditor Demo",
    role: "AUDITOR",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  }
];

module.exports = users;