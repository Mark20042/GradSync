import { createServer } from "http";
import app from "@/app.js";
import { connectDB } from "@/config/db.js";
import { env } from "@/config/environment.js";
import { initializeSocket } from "@/services/socket.service.js";
import { logger } from "@/utils/logger.js";

/**
 * Server Entry Point
 *
 * 1. Connect to the database
 * 2. Create the HTTP server
 * 3. Initialize WebSockets (Socket.IO)
 * 4. Start the server
 */
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP Server
    const server = createServer(app);

    // 3. Initialize Socket.IO
    initializeSocket(server);

    // 4. Start Listening
    const PORT = env.PORT;

    server.listen(PORT, () => {
      logger.info("");
      logger.info("═══════════════════════════════════════════");
      logger.info("  🚀 GradSync Backend (Sirbir Structure)");
      logger.info(`  📡 Server running on port ${PORT}`);
      logger.info(`  🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`  🏥 Health check: http://localhost:${PORT}/health`);
      logger.info("═══════════════════════════════════════════");
      logger.info("");
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
