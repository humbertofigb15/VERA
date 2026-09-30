const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const users = require("../data/users");

const SECRET_KEY = "vera-secret-key";

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

authenticator.options = { window: 1 }; // accept the previous/next 30s code (clock drift)

// ip -> { count, lockUntil }
const loginAttempts = new Map();

// Clean up expired entries so the Map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of loginAttempts) {
    if (rec.lockUntil && rec.lockUntil <= now) loginAttempts.delete(ip);
  }
}, 60 * 1000).unref();

// ---------- helpers ----------

const getLock = (ip) => {
  const rec = loginAttempts.get(ip);
  return rec && rec.lockUntil > Date.now() ? rec : null;
};

const lockedResponse = (res, rec) => {
  const secondsLeft = Math.ceil((rec.lockUntil - Date.now()) / 1000);
  res.set("Retry-After", String(secondsLeft));
  return res.status(429).json({
    message: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(secondsLeft / 60)} minuto(s).`,
    retryAfter: secondsLeft
  });
};

const registerFailure = (ip) => {
  const now = Date.now();
  let rec = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  if (rec.lockUntil && rec.lockUntil <= now) rec = { count: 0, lockUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) rec.lockUntil = now + LOCK_TIME_MS;
  loginAttempts.set(ip, rec);
  return rec;
};

const failureResponse = (res, rec, wrongMessage) => {
  if (rec.lockUntil) {
    return res.status(429).json({
      message: "Demasiados intentos fallidos. Tu acceso está bloqueado por 5 minutos.",
      retryAfter: LOCK_TIME_MS / 1000
    });
  }
  return res.status(401).json({ message: wrongMessage });
};

const issueSession = (res, user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "2h" }
  );

  res.json({
    message: "Inicio de sesión correcto",
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
};

// ---------- step 1: username + password ----------

const login = (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  const lock = getLock(ip);
  if (lock) return lockedResponse(res, lock);

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    const rec = registerFailure(ip);
    return failureResponse(res, rec, "Usuario o contraseña incorrectos");
  }

  // Password OK, but 2FA still pending: do NOT reset the counter yet
  if (user.twoFactorEnabled) {
    const tempToken = jwt.sign(
      { id: user.id, purpose: "2fa" },
      SECRET_KEY,
      { expiresIn: "5m" }
    );
    return res.json({ requires2FA: true, tempToken });
  }

  loginAttempts.delete(ip);
  return issueSession(res, user);
};

// ---------- step 2: 6-digit code ----------

const verify2FA = (req, res) => {
  const ip = req.ip;
  const { tempToken, code } = req.body;

  const lock = getLock(ip);
  if (lock) return lockedResponse(res, lock);

  let payload;
  try {
    payload = jwt.verify(tempToken, SECRET_KEY);
  } catch {
    return res.status(401).json({ message: "Sesión expirada, inicia sesión de nuevo" });
  }

  if (payload.purpose !== "2fa") {
    return res.status(401).json({ message: "Token inválido" });
  }

  const user = users.find((u) => u.id === payload.id);

  const valid =
    user &&
    user.twoFactorEnabled &&
    authenticator.verify({
      token: String(code || ""),
      secret: user.twoFactorSecret
    });

  if (!valid) {
    const rec = registerFailure(ip);
    return failureResponse(res, rec, "Código incorrecto");
  }

  loginAttempts.delete(ip);
  return issueSession(res, user);
};

// ---------- enrollment (requires a normal logged-in session) ----------

const setup2FA = async (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const secret = authenticator.generateSecret();
  user.pendingSecret = secret;

  const otpauth = authenticator.keyuri(user.username, "VERA", secret);
  const qr = await QRCode.toDataURL(otpauth);

  // "secret" lets users type the key manually if they can't scan the QR
  res.json({ qr, secret });
};

const enable2FA = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const ok =
    user.pendingSecret &&
    authenticator.verify({
      token: String(req.body.code || ""),
      secret: user.pendingSecret
    });

  if (!ok) return res.status(400).json({ message: "Código incorrecto" });

  user.twoFactorSecret = user.pendingSecret;
  user.twoFactorEnabled = true;
  user.pendingSecret = null;

  res.json({ message: "2FA activado" });
};

module.exports = { login, verify2FA, setup2FA, enable2FA };