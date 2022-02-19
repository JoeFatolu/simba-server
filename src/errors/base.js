class BaseAppError extends Error {
  constructor(message, status = 200) {
    super(message);
    this.message = message;
    this.appError = true;
    this.status = status;
  }
}

module.exports = BaseAppError;
