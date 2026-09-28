/* API Express 5 do My Money (erros assíncronos chegam ao handler central): autenticação JWT (rotas /oapi) e ciclos de pagamento por usuário (rotas /api) */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const v = require("./lib/validation");

/* Monta a API com repositórios e configuração injetados */
function createApp({ repos, config }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, allowedHeaders: ["Authorization", "Content-Type"] }));
  app.use(express.json({ limit: "100kb" }));

  const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false, message: { errors: ["Muitas tentativas. Aguarde alguns minutos."] } });

  /* Emite o token com o mínimo necessário (sem hash de senha nem documento inteiro) */
  function issue(user) {
    const token = jwt.sign({ sub: String(user._id), name: user.name, email: user.email }, config.authSecret, { expiresIn: config.tokenTtl });
    return { name: user.name, email: user.email, token };
  }

  /* Valida o corpo e responde 400 no formato { errors: [] } */
  function parse(schema, body, res) {
    const result = schema.safeParse(body);
    if (!result.success) {
      res.status(400).json({ errors: v.messages(result.error) });
      return null;
    }
    return result.data;
  }

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  const oapi = express.Router();
  oapi.post("/login", authLimiter, async (req, res) => {
    const data = parse(v.login, req.body, res);
    if (!data) return;
    const user = await repos.users.findByEmailWithPassword(data.email);
    const ok = user && (await bcrypt.compare(data.password, user.password));
    if (!ok) return res.status(401).json({ errors: ["Usuário ou senha inválidos."] });
    return res.json(issue(user));
  });

  oapi.post("/signup", authLimiter, async (req, res) => {
    const data = parse(v.signup, req.body, res);
    if (!data) return;
    try {
      const user = await repos.users.create({ name: data.name, email: data.email, password: await bcrypt.hash(data.password, 10) });
      return res.status(201).json(issue(user));
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ errors: ["Usuário já cadastrado."] });
      throw err;
    }
  });

  oapi.post("/validateToken", (req, res) => {
    try {
      jwt.verify(String(req.body.token || ""), config.authSecret);
      res.json({ valid: true });
    } catch {
      res.json({ valid: false });
    }
  });
  app.use("/oapi", oapi);

  const api = express.Router();
  api.use((req, res, next) => {
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    try {
      req.userId = jwt.verify(token, config.authSecret).sub;
      return next();
    } catch {
      return res.status(401).json({ errors: ["Sessão expirada ou inválida. Entre novamente."] });
    }
  });

  api.get("/billingCycles/count", async (req, res) => res.json({ value: await repos.cycles.count(req.userId) }));
  api.get("/billingCycles/summary", async (req, res) => res.json(await repos.cycles.summary(req.userId)));

  api.get("/billingCycles", async (req, res) => {
    const skip = Math.max(0, Number.parseInt(req.query.skip, 10) || 0);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    res.json(await repos.cycles.list(req.userId, { skip, limit }));
  });

  api.get("/billingCycles/:id", async (req, res) => {
    const found = await repos.cycles.find(req.userId, req.params.id);
    return found ? res.json(found) : res.status(404).json({ errors: ["Ciclo não encontrado."] });
  });

  api.post("/billingCycles", async (req, res) => {
    const data = parse(v.cycle, req.body, res);
    if (!data) return;
    res.status(201).json(await repos.cycles.create(req.userId, data));
  });

  api.put("/billingCycles/:id", async (req, res) => {
    const data = parse(v.cycle, req.body, res);
    if (!data) return;
    const updated = await repos.cycles.update(req.userId, req.params.id, data);
    return updated ? res.json(updated) : res.status(404).json({ errors: ["Ciclo não encontrado."] });
  });

  api.delete("/billingCycles/:id", async (req, res) => {
    const removed = await repos.cycles.remove(req.userId, req.params.id);
    return removed ? res.status(204).end() : res.status(404).json({ errors: ["Ciclo não encontrado."] });
  });
  app.use("/api", api);

  app.use((req, res) => res.status(404).json({ errors: ["Rota não encontrada."] }));

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    return res.status(500).json({ errors: ["Erro interno. Tente novamente."] });
  });

  return app;
}

module.exports = { createApp };
/* Fim de app.js */
