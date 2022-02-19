const { Schema, model } = require("mongoose");

const CurrencySchema = new Schema(
  {
    name: String,
    symbol: String,
    code: String,
    usdRate: Number,
    createdAt: { select: false, type: Date },
    updatedAt: { select: false, type: Date },
    __v: { select: false, type: Number },
  },
  { timestamps: true }
);

module.exports = model("Currency", CurrencySchema);
