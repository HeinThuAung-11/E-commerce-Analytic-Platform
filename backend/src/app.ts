import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import { openApiSpec } from "./config/openapi";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { router } from "./routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  morgan(":method :url :status :response-time ms", {
    skip: (_request, response) => response.statusCode >= 500,
  }),
);
app.get("/openapi.json", (_request, response) => {
  response.status(200).json(openApiSpec);
});
app.get("/docs", (_request, response) => {
  response.status(200).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`);
});
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
