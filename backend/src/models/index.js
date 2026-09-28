/* Modelos Mongoose: usuário e ciclo de pagamento (cada ciclo pertence a um usuário) */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

const creditSchema = new mongoose.Schema({ name: { type: String, required: true }, value: { type: Number, min: 0, required: true } });
const debtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, min: 0, required: true },
  status: { type: String, uppercase: true, enum: ["PAGO", "PENDENTE", "AGENDADO"] },
});

const billingCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, min: 1970, max: 2100, required: true },
    credits: [creditSchema],
    debts: [debtSchema],
  },
  { timestamps: true }
);
billingCycleSchema.index({ userId: 1, year: -1, month: -1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const BillingCycle = mongoose.models.BillingCycle || mongoose.model("BillingCycle", billingCycleSchema, "billingcycles");

module.exports = { User, BillingCycle, mongoose };
/* Fim de models/index.js */
