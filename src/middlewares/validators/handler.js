const { errorResponse } = require("../../helpers/response");

const handleValidationError = (validate, res) => {
  const { message } = validate.error;
  return errorResponse(res, {}, message, 400);
};

module.exports = {
  handleValidationError,
};
