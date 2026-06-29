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

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const allowedOrigins = [
    "http://localhost:5173",
    "https://talk-a-tive-amber.vercel.app",
    "https://talk-a-tive-hzrsd02oo-nikitasolanki-5851s-projects.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  return allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
};
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   res.header("Vary", "Origin");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204);
//   }

//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/debug-version", (req, res) => {
  res.json({
    version: "cors-socket-fix-v4",
    time: new Date().toISOString(),
    origin: req.headers.origin || null,
    frontendUrl: process.env.FRONTEND_URL || null,
  });
});


app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`.yellow.bold);
});
//..................................................Socket.io.....................................................................
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Socket CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) return;

    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    if (!room) return;

    socket.join(room);
    console.log("User Joined Room:", room);
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
      return console.log("chat.users not defined");
    }

    chat.users.forEach((chatUser) => {
      if (!chatUser?._id) return;

      if (
        chatUser._id.toString() === newMessageReceived.sender._id.toString()
      ) {
        return;
      }

      socket.in(chatUser._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
