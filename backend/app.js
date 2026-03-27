const express = require("express");
const path = require("path");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter");
const securityHeaders = require("./middleware/securityHeaders");

const createApp = () => {
  const app = express();
  const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const configuredOrigins = (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  const shouldServeFrontend =
    process.env.SERVE_FRONTEND !== "false" && process.env.NODE_ENV === "production";

  app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
      },
    })
  );
  app.use(rateLimiter);
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      uptime: Math.round(process.uptime()),
    });
  });

  app.use("/api/tasks", taskRoutes);

  if (shouldServeFrontend) {
    app.use(express.static(frontendDistPath));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
