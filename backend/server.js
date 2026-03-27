const dotenv = require("dotenv");
const connectDB = require("./config/db");
const createApp = require("./app");

dotenv.config();

const app = createApp();

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close((error) => {
    if (error) {
      console.error("Error during shutdown", error);
      process.exit(1);
      return;
    }

    process.exit(0);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
