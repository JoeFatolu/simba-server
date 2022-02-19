const Joi = require("joi");
const { handleValidationError } = require("./handler");
const { errorResponse } = require("../../helpers/response");

class CustomerValidator {
  static validateSignUp(req, res, next) {
    const schema = Joi.object(
      {
        firstName: Joi.string().required().error(new Error("First name is required")),
        lastName: Joi.string().required().error(new Error("Last name is required")),
        email: Joi.string().email().required().error(new Error("a valid email is required")),

        password: Joi.string().min(6).required().error(new Error("password is required, minimum six characters")),
      },
      { unknown: true }
    );
    const validate = schema.validate(req.body);
    if (validate.error) {
      return handleValidationError(validate, res);
    }
    return next();
  }
  static validateLogin(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().email().required().error(new Error("a valid email is required")),
      password: Joi.string().required().error(new Error("password is required")),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      const { message } = validate.error;
      return errorResponse(res, {}, message);
    }
    return next();
  }
  static validateCreateTransaction(req, res, next) {
    const schema = Joi.object({
      to: Joi.string().required().error(new Error("Recipiet is required")),
      targetCurrency: Joi.string().required().error(new Error("targetCurrency is required")),
      sourceCurrency: Joi.string().required().error(new Error("sourceCurrency is required")),
      amount: Joi.number().required().error(new Error("a valid amount is required")),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      const { message } = validate.error;
      return errorResponse(res, {}, message);
    }
    return next();
  }
}

module.exports = CustomerValidator;
