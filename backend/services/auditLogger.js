const logAccessChange = ({ actor, action, target, details = {} }) => {
  const entry = {
    date: new Date().toISOString(),
    action,
    actor: { id: actor.id, username: actor.username, role: actor.role },
    target: { id: target.id, username: target.username },
    details
  };

  console.log("[AUDITORÍA DE ACCESOS]", JSON.stringify(entry));
};

module.exports = { logAccessChange };
