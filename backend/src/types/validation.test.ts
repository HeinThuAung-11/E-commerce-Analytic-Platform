import { ordersQuerySchema, revenueQuerySchema } from "./analytics";
import { loginSchema, registerSchema } from "./auth";

describe("validation schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid register payload", () => {
      const result = registerSchema.safeParse({
        body: {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "StrongPass123!",
        },
      });

      expect(result.success).toBe(true);
    });

    it("rejects short name and invalid email", () => {
      const result = registerSchema.safeParse({
        body: {
          name: "J",
          email: "invalid-email",
          password: "StrongPass123!",
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login payload", () => {
      const result = loginSchema.safeParse({
        body: {
          email: "jane@example.com",
          password: "StrongPass123!",
        },
      });

      expect(result.success).toBe(true);
    });

    it("rejects short password", () => {
      const result = loginSchema.safeParse({
        body: {
          email: "jane@example.com",
          password: "short",
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe("revenueQuerySchema", () => {
    it("accepts valid range", () => {
      const result = revenueQuerySchema.safeParse({
        query: {
          range: "30d",
        },
      });

      expect(result.success).toBe(true);
    });

    it("rejects unsupported range", () => {
      const result = revenueQuerySchema.safeParse({
        query: {
          range: "365d",
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe("ordersQuerySchema", () => {
    it("coerces valid pagination values", () => {
      const result = ordersQuerySchema.safeParse({
        query: {
          page: "2",
          limit: "25",
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(2);
        expect(result.data.query.limit).toBe(25);
      }
    });

    it("rejects invalid pagination values", () => {
      const result = ordersQuerySchema.safeParse({
        query: {
          page: 0,
          limit: 200,
        },
      });

      expect(result.success).toBe(false);
    });
  });
});
