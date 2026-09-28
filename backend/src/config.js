/* Configuração lida do ambiente (12-Factor III) */
function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3003,
    mongoUri: env.MONGODB_URI || "mongodb://127.0.0.1:27017/mymoney",
    authSecret: env.AUTH_SECRET || "",
    tokenTtl: env.TOKEN_TTL || "1d",
    corsOrigins: (env.CORS_ORIGINS || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean),
  };
}

module.exports = { loadConfig };
/* Fim de config.js */
