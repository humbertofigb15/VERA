const evidenceItems = [];
let nextId = 1;

const getAll = () => evidenceItems.map((item) => ({ ...item, author: { ...item.author } }));
const create = (data) => {
  const evidence = {
    ...data,
    id: `EVD-${String(nextId++).padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
    author: { ...data.author }
  };
  evidenceItems.unshift(evidence);
  return { ...evidence, author: { ...evidence.author } };
};

module.exports = { getAll, create };
