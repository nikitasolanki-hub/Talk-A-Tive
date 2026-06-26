const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

require("colors");

const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://talk-a-tive-amber.vercel.app",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRoutes);

// -------------------------- deployment --------------------------

const path = require("path");

const __dirnameRoot = path.resolve();

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirnameRoot, "frontend", "dist");

  app.use(express.static(frontendPath));

  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// -------------------------- deployment --------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) return;

    socket.join(userData._id);
    console.log("User joined personal room:", userData._id);

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    if (!room) return;

    socket.join(room);
    console.log("User joined chat room:", room);
  });

  socket.on("typing", (room) => {
    if (!room) return;

    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    if (!room) return;

    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived?.chat;

    if (!chat?.users) {
      console.log("chat.users not defined");
      return;
    }

    chat.users.forEach((chatUser) => {
      if (!chatUser?._id) return;

      if (chatUser._id.toString() === newMessageReceived.sender._id.toString()) {
        return;
      }

      socket.in(chatUser._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});