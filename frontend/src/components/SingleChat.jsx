import { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Input, Spinner, Text } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { io } from "socket.io-client";
import Lottie from "lottie-react";

import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import animationData from "../animations/typing.json";

const ENDPOINT = "http://localhost:5000";
const API_BASE_URL = "http://localhost:5000";

let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageError, setMessageError] = useState("");

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
  }, [user?.token]);

  const fetchMessages = async () => {
    if (!selectedChat?._id || !user?.token) return;

    try {
      setLoading(true);
      setMessageError("");

      const { data } = await axios.get(
        `${API_BASE_URL}/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);

      if (socket) {
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      setMessageError(
        error?.response?.data?.message || "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedChat?._id) return;
    if (!user?.token) {
      setMessageError("User token missing. Please login again.");
      return;
    }

    const messageToSend = newMessage.trim();

    try {
      setSendLoading(true);
      setMessageError("");
      setNewMessage("");

      if (socket) {
        socket.emit("stop typing", selectedChat._id);
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/api/message`,
        {
          content: messageToSend,
          chatId: selectedChat._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (socket) {
        socket.emit("new message", data);
      }

      setMessages((prev) => [...prev, data]);
    } catch (error) {
      setNewMessage(messageToSend);
      setMessageError(
        error?.response?.data?.message || "Failed to send message"
      );
    } finally {
      setSendLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !selectedChat?._id || !socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        const alreadyNotified = notification.some(
          (notif) => notif._id === newMessageReceived._id
        );

        if (!alreadyNotified) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain?.(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [notification, setNotification, fetchAgain, setFetchAgain]);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            pb={3}
            px={2}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="Back"
              variant="ghost"
              colorPalette="blue"
              onClick={() => setSelectedChat(null)}
            >
              <FaArrowLeft />
            </IconButton>

            <Text
              fontSize={{ base: "24px", md: "28px" }}
              fontFamily="Work sans"
              fontWeight="bold"
              color="black"
            >
              {!selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName.toUpperCase()}
            </Text>

            {!selectedChat.isGroupChat ? (
              <ProfileModal user={getSenderFull(user, selectedChat.users)} />
            ) : (
              <UpdateGroupChatModal
                fetchMessages={fetchMessages}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
              />
            )}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="gray.100"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {messageError && (
              <Text color="red.500" fontSize="sm" mb={2}>
                {messageError}
              </Text>
            )}

            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
                color="blue.500"
              />
            ) : (
              <Box className="messages" overflowY="auto">
                <ScrollableChat messages={messages} />
              </Box>
            )}

            {isTyping && (
              <Box width="70px" mb={2}>
                <Lottie animationData={animationData} loop autoplay />
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={2} mt={3}>
              <Input
                bg="gray.200"
                color="black"
                _placeholder={{ color: "gray.500" }}
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleKeyDown}
              />

              <IconButton
                aria-label="Send message"
                bg="blue.800"
                color="white"
                _hover={{ bg: "blue.900" }}
                _active={{ bg: "blue.950" }}
                _disabled={{
                  bg: "blue.800",
                  color: "white",
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
                cursor={newMessage.trim() ? "pointer" : "not-allowed"}
                onClick={handleSendMessage}
                loading={sendLoading}
                disabled={!newMessage.trim()}
              >
                <IoSend />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="black">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;