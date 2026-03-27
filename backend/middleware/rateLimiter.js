const store = new Map();

const getWindowMs = () => Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const getMaxRequests = () => Number(process.env.RATE_LIMIT_MAX || 200);

const cleanupExpiredEntries = (now) => {
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
};

const rateLimiter = (req, res, next) => {
  const now = Date.now();
  const windowMs = getWindowMs();
  const maxRequests = getMaxRequests();

  cleanupExpiredEntries(now);

  const key = req.ip || req.socket.remoteAddress || "unknown";
  const currentEntry = store.get(key);

  if (!currentEntry || currentEntry.resetTime <= now) {
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - 1, 0));
    res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
    return next();
  }

  currentEntry.count += 1;

  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - currentEntry.count, 0));
  res.setHeader("X-RateLimit-Reset", Math.ceil(currentEntry.resetTime / 1000));

  if (currentEntry.count > maxRequests) {
    const error = new Error("Too many requests, please try again later.");
    error.statusCode = 429;
    return next(error);
  }

  return next();
};

rateLimiter.resetStore = () => {
  store.clear();
};

module.exports = rateLimiter;
