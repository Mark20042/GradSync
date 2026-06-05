import { createServer } from "http";
import app from "@/app.js";
import { connectDB } from "@/config/db.js";
import { env } from "@/config/environment.js";
import { initializeSocket } from "@/services/socket.service.js";


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
      console.log("");
      console.log("═══════════════════════════════════════════");
      console.log("  🚀 GradSync Backend (Sirbir Structure)");
      console.log(`  📡 Server running on port ${PORT}`);
      console.log(`  🌍 Environment: ${env.NODE_ENV}`);
      console.log(`  🏥 Health check: http://localhost:${PORT}/health`);
      console.log("═══════════════════════════════════════════");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
