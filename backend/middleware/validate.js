const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator chains. Returns the first message plus per-field details.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = {};
  result.array().forEach((e) => { if (!details[e.path]) details[e.path] = e.msg; });
  next(new ApiError(400, Object.values(details)[0], details));
};
