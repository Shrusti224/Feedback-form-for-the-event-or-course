export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || "Internal server error",
  });
};