const MIN_JWT_SECRET_LENGTH = 32;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== "string" || secret.trim().length < MIN_JWT_SECRET_LENGTH) {
    throw new Error("JWT_SECRET must be set to at least 32 characters.");
  }

  return secret.trim();
}

module.exports = { getJwtSecret };
