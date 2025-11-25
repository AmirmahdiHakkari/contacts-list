export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Object} [options]
   * @param {Array} [options.errors]
   * @param {boolean} [options.isOperational]
   */
  constructor(statusCode, message, options = {}) {
    super(message);

    this.statusCode = statusCode;
    this.errors = options.errors || [];
    this.isOperational = options.isOperational ?? true;

    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
