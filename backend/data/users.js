const users = [
  {
    id: 1,
    username: "superadmin",
    email: "superadmin@vera.local",
    password: "vera123",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 2,
    username: "demo",
    email: "demo@vera.local",
    password: "vera123",
    name: "Usuario Demo",
    role: "DIRECTOR",
    status: "ACTIVE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 3,
    username: "gerente",
    email: "gerente@vera.local",
    password: "vera123",
    name: "Gerente Demo",
    role: "GERENTE",
    status: "ACTIVE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 4,
    username: "jefatura",
    email: "jefatura@vera.local",
    password: "vera123",
    name: "Jefatura Demo",
    role: "JEFATURA",
    status: "ACTIVE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    id: 5,
    username: "auditor",
    email: "auditor@vera.local",
    password: "vera123",
    name: "Auditor Demo",
    role: "AUDITOR",
    status: "ACTIVE",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null   // used only during enrollment
  },
  {
    // Solicitud de ejemplo para probar la aprobación. Contraseña: Vera1234
    id: 6,
    username: "solicitud@vera.local",
    email: "solicitud@vera.local",
    password: "Vera1234",
    name: "Solicitud Demo",
    role: "JEFATURA",
    status: "PENDING",
    requestedAt: "2026-09-30T18:00:00.000Z",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    pendingSecret: null
  }
];

module.exports = users;