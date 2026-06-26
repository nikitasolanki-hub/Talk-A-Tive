const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat ID is required");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name pic email")
    .populate("chat");

  res.status(200).json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Content and chatId are required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const isUserInChat = chat.users.some(
    (chatUserId) => chatUserId.toString() === req.user._id.toString()
  );

  if (!isUserInChat) {
    res.status(403);
    throw new Error("You are not allowed to send message in this chat");
  }

  let message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  message = await Message.findById(message._id)
    .populate("sender", "name pic email")
    .populate("chat");

  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.status(201).json(message);
});

module.exports = {
  allMessages,
  sendMessage,
};