'use strict';

function paginate(req, res, next) {
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  req.pagination = { page, limit };
  next();
}

module.exports = paginate;
