const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const color = require("colors");

const userRouter = require("./routes/userRoutes");
const chats = require("./data/data");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); //to accept JSON Data

app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("API is Running");
// });

// app.get("/api/chat", (req, res) => {
//   res.json(chats);
// });

app.use("/api/user", userRouter);

app.use(notFound);
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`.yellow.bold);
});