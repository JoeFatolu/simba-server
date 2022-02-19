const mongoose = require("mongoose");


class BaseProvider {
  constructor(model) {
    this.model = model;
    this.user = null;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findOne(data) {
    return this.model.findOne(data).exec();
  }

  async findOneAndDelete(data) {
    return this.model.findOneAndDelete(data).exec();
  }

  async find(data) {
    return this.model.find(data).exec();
  }

  async updateById(id, data) {
    return this.model
      .findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
      .exec();
  }

  async findOneAndPopulate(data, ref) {
    try {
      return await this.model.findOne(data).populate(ref);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = BaseProvider;
