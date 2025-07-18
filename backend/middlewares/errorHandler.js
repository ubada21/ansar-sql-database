const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.message || 'Something went wrong';
  const code = err.code || undefined;
  const data = err.data || undefined;
  const isDev = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    message: msg,
    ...(code && { code }),
    ...(data && { data }),
    ...(isDev && { stack: err.stack }),
  };

  console.error(`[${new Date().toISOString()}] ${msg}`);
  if (isDev) console.error(err.stack);

  res.status(status).json(errorResponse);
};

module.exports = errorHandler;

