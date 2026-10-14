// Runs when no route matches
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// One place that turns every error into a clean JSON response
const errorHandler = (err, req, res, next) => {
  // Mongoose validation errors -> 400 with readable message
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }

  // Bad ObjectId format
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID or value format' });
  }

  // Invalid JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Server error. Please try again later.' : err.message;
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ message });
};

module.exports = { notFound, errorHandler };
