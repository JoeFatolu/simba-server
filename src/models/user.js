const { Schema, model } = require("mongoose");

const AccountSchema = new Schema({
  balance: { type: Number, default: 0 },
  currency: {
    type: Schema.Types.ObjectId,
    ref: "Currency",
  },
});

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    hash: String,
    salt: String,
    accounts: [AccountSchema],
  },
  { timestamps: true }
);

// Prevent these attributes from being returned by the API
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  obj.name = `${obj.firstName} ${obj.lastName}`;
  delete obj.hash;
  delete obj.salt;
  delete obj._id;
  delete obj.__v;
  delete obj.__v;
  return obj;
};

module.exports = model("User", UserSchema);
