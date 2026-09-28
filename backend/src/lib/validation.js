/* Esquemas zod de autenticação e ciclo de pagamento */
const { z } = require("zod");

const money = z.coerce.number().finite().min(0).max(100_000_000).transform((n) => Math.round(n * 100) / 100);
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

/* Converte issues do zod em mensagens simples (formato { errors: [] } do front) */
function messages(error) {
  return error.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message));
}

module.exports = { signup, login, cycle, messages, STATUS };
/* Fim de validation.js */
