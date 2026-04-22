export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const msg = err.message || "Internal Server Error";
  res.status(status).json({ error: msg });
};
