/* Repositórios sobre MongoDB/Mongoose; toda consulta de ciclo filtra pelo dono (userId) */
const { User, BillingCycle, mongoose } = require("../models");

const isId = (id) => mongoose.isValidObjectId(id);
const plain = (doc) => (doc ? JSON.parse(JSON.stringify(doc)) : null);

/* Cria os repositórios de usuário e ciclo */
function createMongoRepositories() {
  return {
    users: {
      findByEmailWithPassword: (email) => User.findOne({ email }).select("+password").lean(),
      create: async (u) => plain(await User.create(u)),
    },
    cycles: {
      list: (userId, { skip = 0, limit = 50 } = {}) =>
        BillingCycle.find({ userId }).sort({ year: -1, month: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      count: (userId) => BillingCycle.countDocuments({ userId }),
      find: (userId, id) => (isId(id) ? BillingCycle.findOne({ _id: id, userId }).lean() : null),
      create: async (userId, data) => plain(await BillingCycle.create({ ...data, userId })),
      update: (userId, id, data) =>
        isId(id) ? BillingCycle.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }).lean() : null,
      remove: async (userId, id) => (isId(id) ? (await BillingCycle.deleteOne({ _id: id, userId })).deletedCount === 1 : false),
      async summary(userId) {
        const [row] = await BillingCycle.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          { $project: { credit: { $sum: "$credits.value" }, debt: { $sum: "$debts.value" } } },
          { $group: { _id: null, credit: { $sum: "$credit" }, debt: { $sum: "$debt" } } },
        ]);
        const credit = Math.round((row?.credit || 0) * 100) / 100;
        const debt = Math.round((row?.debt || 0) * 100) / 100;
        return { credit, debt, balance: Math.round((credit - debt) * 100) / 100 };
      },
    },
  };
}

module.exports = { createMongoRepositories };
/* Fim de mongo.js */
