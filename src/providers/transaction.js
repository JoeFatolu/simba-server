const mongoose = require("mongoose");
const Transaction = mongoose.model("Transaction");
const BaseProvider = require("./base");

class TransactionProvider extends BaseProvider {
  constructor(model) {
    super(model);
    this.model = model;
    this.user = null;
  }
}

module.exports = new TransactionProvider(Transaction);
