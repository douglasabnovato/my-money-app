/* Testes da API com repositórios em memória: autenticação, isolamento por usuário e validação */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { createApp } = require("../src/app");
const { createMemoryRepositories } = require("../src/repositories/memory");
const { loadConfig } = require("../src/config");
const { summarize } = require("../src/domain/summary");

const SECRET = "s".repeat(40);

/* App isolado */
function build() {
  return createApp({ repos: createMemoryRepositories(), config: { ...loadConfig({}), authSecret: SECRET } });
}

/* Cadastra e devolve o token */
async function signup(app, email) {
  const res = await request(app).post("/oapi/signup").send({ name: "Pessoa", email, password: "Senha123", confirm_password: "Senha123" }).expect(201);
  return res.body.token;
}

const cycle = { name: "Setembro", month: 9, year: 2026, credits: [{ name: "Salário", value: "5000.10" }], debts: [{ name: "Aluguel", value: 1500.05, status: "pago" }] };

test("resumo soma em centavos sem erro de ponto flutuante", () => {
  const s = summarize([{ credits: [{ value: 0.1 }, { value: 0.2 }], debts: [{ value: 0.3 }] }]);
  assert.deepEqual(s, { credit: 0.3, debt: 0.3, balance: 0 });
});

test("token não carrega hash de senha nem dados internos", async () => {
  const app = build();
  const token = await signup(app, "ana@ex.com");
  const payload = jwt.decode(token);
  assert.deepEqual(Object.keys(payload).sort(), ["email", "exp", "iat", "name", "sub"]);
  assert.doesNotMatch(JSON.stringify(payload), /\$2[aby]\$/);
});

test("login: senha errada 401, certa 200; cadastro repetido 409", async () => {
  const app = build();
  await signup(app, "ana@ex.com");
  await request(app).post("/oapi/login").send({ email: "ana@ex.com", password: "errada" }).expect(401);
  await request(app).post("/oapi/login").send({ email: "ANA@ex.com", password: "Senha123" }).expect(200);
  await request(app).post("/oapi/signup").send({ name: "Ana", email: "ana@ex.com", password: "Senha123", confirm_password: "Senha123" }).expect(409);
});

test("senha fraca e confirmação diferente são recusadas", async () => {
  const app = build();
  const res = await request(app).post("/oapi/signup").send({ name: "Ana", email: "a@ex.com", password: "abc", confirm_password: "abd" }).expect(400);
  assert.ok(res.body.errors.length >= 2);
});

test("sem token ou com token inválido a API responde 401", async () => {
  const app = build();
  await request(app).get("/api/billingCycles").expect(401);
  await request(app).get("/api/billingCycles").set("Authorization", "abc").expect(401);
});

test("CRUD de ciclo e resumo do próprio usuário", async () => {
  const app = build();
  const token = await signup(app, "ana@ex.com");
  const created = await request(app).post("/api/billingCycles").set("Authorization", token).send(cycle).expect(201);
  assert.equal(created.body.debts[0].status, "PAGO");
  const id = created.body._id;
  await request(app).put(`/api/billingCycles/${id}`).set("Authorization", `Bearer ${token}`).send({ ...cycle, name: "Setembro revisado" }).expect(200);
  const list = await request(app).get("/api/billingCycles").set("Authorization", token).expect(200);
  assert.equal(list.body[0].name, "Setembro revisado");
  const summary = await request(app).get("/api/billingCycles/summary").set("Authorization", token).expect(200);
  assert.deepEqual(summary.body, { credit: 5000.1, debt: 1500.05, balance: 3500.05 });
  await request(app).delete(`/api/billingCycles/${id}`).set("Authorization", token).expect(204);
  assert.equal((await request(app).get("/api/billingCycles/count").set("Authorization", token)).body.value, 0);
});

test("usuário não vê, altera nem apaga ciclo de outro (IDOR)", async () => {
  const app = build();
  const ana = await signup(app, "ana@ex.com");
  const bia = await signup(app, "bia@ex.com");
  const { body } = await request(app).post("/api/billingCycles").set("Authorization", ana).send(cycle).expect(201);
  await request(app).get(`/api/billingCycles/${body._id}`).set("Authorization", bia).expect(404);
  await request(app).put(`/api/billingCycles/${body._id}`).set("Authorization", bia).send(cycle).expect(404);
  await request(app).delete(`/api/billingCycles/${body._id}`).set("Authorization", bia).expect(404);
  const summary = await request(app).get("/api/billingCycles/summary").set("Authorization", bia).expect(200);
  assert.deepEqual(summary.body, { credit: 0, debt: 0, balance: 0 });
});

test("ciclo inválido responde 400 com mensagens", async () => {
  const app = build();
  const token = await signup(app, "ana@ex.com");
  const res = await request(app).post("/api/billingCycles").set("Authorization", token).send({ name: "", month: 13, year: 1900, debts: [{ name: "x", value: -1, status: "QUALQUER" }] }).expect(400);
  assert.ok(res.body.errors.length >= 4);
});
test("falha do banco vira 500 no formato { errors } (sem travar a requisição)", async () => {
  const repos = createMemoryRepositories();
  repos.cycles.list = async () => { throw new Error("mongo fora"); };
  const app = createApp({ repos, config: { ...loadConfig({}), authSecret: SECRET } });
  const token = await signup(app, "ana@ex.com");
  const res = await request(app).get("/api/billingCycles").set("Authorization", token).expect(500);
  assert.deepEqual(res.body, { errors: ["Erro interno. Tente novamente."] });
});
/* Fim de api.test.js */
