

module.exports = (err, req, res, next) => {
  console.error("Error Middleware: ", err)
  const status = err.status || 500
  const msg = err.message || "Something went wront"
  res.status(status).json({
    success: false,
    message: msg,
  });
}
