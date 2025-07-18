
class CustomError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} status - HTTP status code (e.g. 404, 400, 500)
   * @param {string} [code] - Optional machine-readable error code
   * @param {object} [data] - Optional extra data to include with the error
   */
  constructor(message, status = 500, code = undefined, data = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    if (code) this.code = code;
    if (data) this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;

