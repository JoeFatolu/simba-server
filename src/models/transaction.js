const { Schema, model } = require("mongoose");
const aggregatePaginate = require("./module");

const TransactionSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User" },
    to: { type: Schema.Types.ObjectId, ref: "User" },
    amountSent: Number,
    amountReceived: Number,
    by: { type: Schema.Types.ObjectId, ref: "User" },
    fromCurrency: { type: Schema.Types.ObjectId, ref: "Currency" },
    toCurrency: { type: Schema.Types.ObjectId, ref: "Currency" },
  },
  { timestamps: true }
);

TransactionSchema.plugin(aggregatePaginate);
module.exports = model("Transaction", TransactionSchema);
