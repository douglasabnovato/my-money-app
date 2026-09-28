/* Atribui ciclos antigos (sem dono) ao usuário informado: node scripts/claim-orphans.js email@dominio.com */
require("dotenv").config();
const mongoose = require("mongoose");
const { loadConfig } = require("../src/config");
const { User, BillingCycle } = require("../src/models");

/* Executa a migração de posse dos ciclos */
async function main() {
  const email = String(process.argv[2] || "").toLowerCase();
  if (!email) throw new Error("Informe o e-mail do usuário.");
  await mongoose.connect(loadConfig().mongoUri);
  const user = await User.findOne({ email });
  if (!user) throw new Error(`Usuário ${email} não encontrado.`);
  const result = await BillingCycle.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } });
  console.log(`${result.modifiedCount} ciclo(s) atribuídos a ${email}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
/* Fim de claim-orphans.js */
