const mongoose = require("mongoose");
const Currency = mongoose.model("Currency");
const BaseProvider = require("./base");

class CurrencyProvider extends BaseProvider {
  constructor(model) {
    super(model);
    this.model = model;
    this.user = null;
  }
}

module.exports = new CurrencyProvider(Currency);
