/**
 * @file Defines custom Express middleware functions.
 */

const Boom = require('@hapi/boom');

/**
 * A higher-order function that wraps an async callback to properly trigger the
 * Express error-handling middleware on errors.
 *
 * @param {Function} fn an async callback.
 * @returns {Function} an Express callback that resolves the wrapped async fn.
 */
const asyncWrapper = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * A catch-all error handler that sends a formatted JSON response.
 * Uses Boom to set the status code and provide consistent formatting.
 *
 * If using multiple error handlers, this should be the last one.
 *
 * @param {Object} err a javascript Error object.
 * @param {Object} req the Express request object.
 * @param {Object} res the Express response object.
 * @param {Function} next the Express next callback.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // handle errors from the Plaid api.
  if (error.name === 'PlaidError')
    error = new Boom(error.error_message, { statusCode: error.status_code });

  // handle standard javascript errors.
  if (!error.isBoom) error = Boom.boomify(error);

  // these are generated by Boom, so they're guaranteed to exist.
  const { statusCode, payload } = error.output;
  res.status(statusCode).json(payload);
};

module.exports = { asyncWrapper, errorHandler };