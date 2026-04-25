import { createServer } from 'http';
import createApp from './app.js';
import { connectDB } from './shared/config/database.js';
import { env } from './shared/config/environment.js';
import { initializeSocket } from './shared/sockets/socket.service.js';

/**
 * Server Entry Point
 *
 * This file is responsible for booting up the application:
 * 1. Connecting to the database
 * 2. Creating the Express app
 * 3. Creating the HTTP server
 * 4. Initializing WebSockets (Socket.IO)
 * 5. Starting the server
 */
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Build the Express App
    const app = createApp();

    // 3. Create HTTP Server
    const server = createServer(app);

    // 4. Initialize Socket.IO
    initializeSocket(server);

    // 5. Start Listening
    server.listen(env.PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('  🚀 GradSync Modular Backend');
      console.log(`  📡 Server running on port ${env.PORT}`);
      console.log(`  🌍 Environment: ${env.NODE_ENV}`);
      console.log(`  🏥 Health check: http://localhost:${env.PORT}/health`);
      console.log('═══════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
