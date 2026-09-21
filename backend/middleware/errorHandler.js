module.exports = (err, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}:`, err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};
