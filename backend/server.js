require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const connectDB = require("./config/db");

// --- Socket.IO & HTTP Imports ---
const http = require("http");
const { Server } = require("socket.io");

// --- Model Imports ---
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

// --- Route Imports ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const SavedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
// --- Chat Route Imports ---
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// --- CORS Config ---
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// --- Database Connection ---
connectDB();

// --- Core Middlewares ---
app.use(express.json());

// --- Create HTTP Server & Socket.IO Server ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// --- Socket.IO Connection Logic ---
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 1. User joins a room with their own User ID
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room: ${userId}`);
  });

  // 2. Listen for a new message
  socket.on(
    "sendMessage",
    async ({ conversationId, senderId, recipientId, content }) => {
      try {
        const User = require("./models/User");
        const { createNotification } = require("./controllers/notificationController");

        // 3. Save the new message to the database
        const newMessage = new Message({
          conversationId,
          sender: senderId,
          content,
        });
        const savedMessage = await newMessage.save();

        // 4. Update the conversation's 'lastMessage' for UI previews
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: content,
            sender: senderId,
            sentAt: new Date(),
          },
        });

        // 5. Populate sender info before emitting
        const populatedMessage = await Message.findById(
          savedMessage._id
        ).populate("sender", "fullName avatar");

        // 6. Create notification for the recipient
        const sender = await User.findById(senderId).select("fullName");
        await createNotification(
          recipientId,
          "MESSAGE",
          "New Message",
          `${sender.fullName || "Someone"} sent you a message`,
          conversationId
        );

        // 7. Emit the message *only* to the recipient's room
        io.to(recipientId).emit("receiveMessage", populatedMessage);

        // 8. Check for Auto-Reply (Employer Auto-Pilot)
        const { checkAndSendAutoReply } = require("./utils/autoReplyHelper");
        await checkAndSendAutoReply(recipientId, senderId, content, conversationId, io);

      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("messageError", { message: "Could not send message" });
      }
    }
  );

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// --- End Socket.IO Logic ---

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", SavedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Chat API Routes ---
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// --- AI Routes ---
app.use("/api/ai", aiRoutes);

// --- Employer Routes ---
const employerRoutes = require("./routes/employerRoutes");
app.use("/api/employer", employerRoutes);

// --- Admin Routes ---
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);



// --- Serve Static Assets (Uploads) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// --- Start the Server ---
const PORT = process.env.PORT || 8000;

// IMPORTANT: Use server.listen() to start the Socket.IO server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
