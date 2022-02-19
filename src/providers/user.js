const mongoose = require("mongoose");
const User = mongoose.model("User");
const BaseProvider = require("./base");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");

class UserProvider extends BaseProvider {
  constructor(userModel) {
    super(userModel);
    this.userModel = userModel;
    this.user = null;
  }

  generateJWT(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 30);

    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      exp: Math.trunc(exp.getTime() / 1000),
    };

    // Used only for merchant users
    if (user.merchantId) {
      payload.merchantId = user.merchantId;
    }

    return jwt.sign(payload, secret);
  }

  setPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 512, "sha512")
      .toString("hex");
    return { salt, hash };
  }

  validPassword(passwordInfo) {
    const hash = crypto
      .pbkdf2Sync(
        passwordInfo.password,
        passwordInfo.salt,
        10000,
        512,
        "sha512"
      )
      .toString("hex");
    return passwordInfo.hash === hash;
  }
}

module.exports = new UserProvider(User);
