process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ecommerce_analytics_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-should-be-at-least-32-chars";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-should-be-at-least-32-chars";
process.env.ACCESS_TOKEN_EXPIRES_IN_MINUTES = "15";
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS = "7";
