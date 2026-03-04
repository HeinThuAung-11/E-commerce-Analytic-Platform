import rateLimit from "express-rate-limit";

export const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many analytics requests. Please try again later.",
    errorCode: "RATE_LIMIT_001",
  },
});
