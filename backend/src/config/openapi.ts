export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "E-Commerce Analytics Platform API",
    version: "1.0.0",
    description: "Production-grade backend API for e-commerce analytics.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      refreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["success", "message", "errorCode"],
        properties: {
          success: { type: "boolean", const: false },
          message: { type: "string" },
          errorCode: { type: "string" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 128 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 128 },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", const: true },
          message: { type: "string" },
          data: {
            type: "object",
            required: ["accessToken", "user"],
            properties: {
              accessToken: { type: "string" },
              user: {
                type: "object",
                required: ["id", "name", "email", "role"],
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  role: { type: "string", enum: ["ADMIN", "MANAGER", "ANALYST"] },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
          },
        },
      },
    },
    "/health/readiness": {
      get: {
        summary: "Readiness check (database + redis)",
        responses: {
          "200": {
            description: "Service dependencies are ready",
          },
          "503": {
            description: "Service dependencies are not ready",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh access token",
        security: [{ refreshCookie: [] }],
        responses: {
          "200": {
            description: "Token refreshed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Refresh token invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logout user",
        security: [{ refreshCookie: [] }],
        responses: {
          "200": {
            description: "Logout success",
          },
        },
      },
    },
    "/analytics/overview": {
      get: {
        summary: "Get analytics overview",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Overview fetched" },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/analytics/revenue": {
      get: {
        summary: "Get revenue by range",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            required: true,
            schema: {
              type: "string",
              enum: ["7d", "30d", "90d"],
            },
          },
        ],
        responses: {
          "200": { description: "Revenue fetched" },
          "400": {
            description: "Invalid range",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/analytics/top-products": {
      get: {
        summary: "Get top products",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Top products fetched" },
        },
      },
    },
    "/analytics/order-trend": {
      get: {
        summary: "Get order trend by range",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            required: true,
            schema: {
              type: "string",
              enum: ["7d", "30d", "90d"],
            },
          },
        ],
        responses: {
          "200": { description: "Order trend fetched" },
        },
      },
    },
    "/analytics/revenue-by-status": {
      get: {
        summary: "Get revenue grouped by order status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "range",
            required: true,
            schema: {
              type: "string",
              enum: ["7d", "30d", "90d"],
            },
          },
        ],
        responses: {
          "200": { description: "Revenue by status fetched" },
        },
      },
    },
    "/analytics/category-distribution": {
      get: {
        summary: "Get product category distribution",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Category distribution fetched" },
        },
      },
    },
    "/orders": {
      get: {
        summary: "Get paginated orders",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": { description: "Orders fetched" },
        },
      },
    },
    "/products": {
      get: {
        summary: "Get paginated products list",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": { description: "Products fetched" },
        },
      },
    },
  },
};
