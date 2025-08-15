module.exports = (err, req, res, next) => {
  console.error(`!!! [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);

  
  next(err);
};

