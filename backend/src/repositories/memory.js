/* Repositórios em memória com o mesmo contrato do Mongo (testes e demonstração local) */
const crypto = require("crypto");
const { summarize } = require("../domain/summary");

const newId = () => crypto.randomBytes(12).toString("hex");
const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

/* Cria repositórios isolados */
function createMemoryRepositories() {
  const users = [];
  let cycles = [];
  const own = (userId, id) => cycles.find((c) => c._id === id && c.userId === userId);
  const mine = (userId) =>
    cycles.filter((c) => c.userId === userId).sort((a, b) => b.year - a.year || b.month - a.month || (a._id < b._id ? 1 : -1));
  return {
    users: {
      findByEmailWithPassword: async (email) => clone(users.find((u) => u.email === email)) || null,
      create: async (u) => {
        if (users.some((x) => x.email === u.email)) {
          const err = new Error("duplicate");
          err.code = 11000;
          throw err;
        }
        const user = { _id: newId(), ...u };
        users.push(user);
        const { password, ...safe } = user;
        return clone(safe);
      },
    },
    cycles: {
      list: async (userId, { skip = 0, limit = 50 } = {}) => clone(mine(userId).slice(skip, skip + limit)),
      count: async (userId) => mine(userId).length,
      find: async (userId, id) => clone(own(userId, id)) || null,
      create: async (userId, data) => {
        const doc = { _id: newId(), userId, ...clone(data) };
        cycles.push(doc);
        return clone(doc);
      },
      update: async (userId, id, data) => {
        const doc = own(userId, id);
        if (!doc) return null;
        Object.assign(doc, clone(data));
        return clone(doc);
      },
      remove: async (userId, id) => {
        const before = cycles.length;
        cycles = cycles.filter((c) => !(c._id === id && c.userId === userId));
        return cycles.length < before;
      },
      summary: async (userId) => summarize(mine(userId)),
    },
  };
}

module.exports = { createMemoryRepositories };
/* Fim de memory.js */
