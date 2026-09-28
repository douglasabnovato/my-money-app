/* Ponto de entrada: valida o segredo, conecta ao MongoDB e sobe a API */
require("dotenv").config();
const mongoose = require("mongoose");
const { loadConfig } = require("./config");
const { createMongoRepositories } = require("./repositories/mongo");
const { createMemoryRepositories } = require("./repositories/memory");
const { createApp } = require("./app");

/* Inicializa a aplicação */
async function main() {
  const config = loadConfig();
  if (config.authSecret.length < 32) {
    console.error("Defina AUTH_SECRET com pelo menos 32 caracteres (veja .env.example).");
    process.exit(1);
  }
  let repos;
  if (config.mongoUri === "memory") {
    console.warn("MONGODB_URI=memory: dados em memória, apagados ao reiniciar (use só para demonstração).");
    repos = createMemoryRepositories();
  } else {
    await mongoose.connect(config.mongoUri);
    repos = createMongoRepositories();
  }
  createApp({ repos, config }).listen(config.port, () => console.log(`My Money API na porta ${config.port}`));
}

main().catch((err) => {
  console.error("Falha ao iniciar:", err.message);
  process.exit(1);
});
/* Fim de server.js */
