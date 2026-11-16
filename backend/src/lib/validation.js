/* Esquemas zod de autenticação e ciclo de pagamento */
const { z } = require("zod");

/* Aceita o valor como o front envia: número, "1500.5" ou no formato brasileiro "1.500,50" */
function toNumber(v) {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (!s.includes(",")) return s;
  /* Só o formato brasileiro: "1500,50" ou "1.500,50"; misturas como "1,500.50" ficam inválidas (400) */
  return /^\d{1,3}(\.\d{3})*,\d+$|^\d+,\d+$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : "inválido";
}

const money = z.preprocess(toNumber, z.coerce.number().finite().min(0).max(100_000_000).transform((n) => Math.round(n * 100) / 100));
const STATUS = ["PAGO", "PENDENTE", "AGENDADO"];

const signup = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8, "A senha precisa ter pelo menos 8 caracteres.")
      .max(72)
      .regex(/[a-z]/, "Inclua uma letra minúscula.")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula.")
      .regex(/\d/, "Inclua um número."),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, { message: "As senhas não conferem.", path: ["confirm_password"] });

const login = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const cycle = z.object({
  name: z.string().trim().min(1).max(80),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1970).max(2100),
  credits: z.array(z.object({ name: z.string().trim().min(1).max(80), value: money })).max(200).default([]),
  debts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        value: money,
        status: z.preprocess((v) => (v ? String(v).toUpperCase() : undefined), z.enum(STATUS).optional()),
      })
    )
    .max(200)
    .default([]),
});

/* Nome que a pessoa vê na tela para cada campo da API */
const LABELS = {
  name: "Nome", email: "E-mail", password: "Senha", confirm_password: "Confirmar senha",
  month: "Mês", year: "Ano", credits: "Créditos", debts: "Débitos", value: "valor", status: "status",
};

/* Mensagem em português por tipo de erro; as mensagens próprias do esquema (senha) têm prioridade (#23) */
function ptBR(issue) {
  const texto = issue.origin === "string";
  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined ? "campo obrigatório" : "informe um valor válido";
    case "too_small":
      if (texto) return issue.minimum <= 1 ? "preencha este campo" : `use pelo menos ${issue.minimum} caracteres`;
      return issue.origin === "array" ? "lista vazia" : `informe um valor a partir de ${issue.minimum}`;
    case "too_big":
      if (texto) return `use no máximo ${issue.maximum} caracteres`;
      return issue.origin === "array" ? `no máximo ${issue.maximum} linhas` : `informe um valor até ${issue.maximum}`;
    case "invalid_format":
      return issue.format === "email" ? "informe um e-mail válido" : "formato inválido";
    case "invalid_value":
      return "escolha uma opção da lista";
    default:
      return "valor inválido";
  }
}

/* Valida com as mensagens em português (passar como 2º argumento de safeParse) */
const parseOptions = { error: ptBR };

/* "debts.0.value" vira "Débitos, linha 1, valor" (formato { errors: [] } do front) */
function messages(error) {
  return error.issues.map((i) => {
    if (!i.path.length) return i.message;
    const onde = i.path
      .map((p, n) => (typeof p === "number" ? `linha ${p + 1}` : n > 0 ? (LABELS[p] || p).toLowerCase() : LABELS[p] || p))
      .join(", ");
    return `${onde}: ${i.message}`;
  });
}

module.exports = { signup, login, cycle, messages, parseOptions, STATUS };
/* Fim de validation.js */
