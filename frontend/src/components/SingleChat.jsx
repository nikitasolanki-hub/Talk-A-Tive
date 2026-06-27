import { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Input, Spinner, Text } from "@chakra-ui/react";
import { FaArrowLeft, FaSmile } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import EmojiPicker from "emoji-picker-react";

import animationData from "../animations/typing.json";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://talk-a-tive-8412.onrender.com";

const ENDPOINT = API_BASE_URL;

const LottiePlayer = Lottie?.default || Lottie;
const EmojiPickerComponent = EmojiPicker?.default || EmojiPicker;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const socketRef = useRef(null);
  const selectedChatCompareRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { selectedChat, setSelectedChat, user, setNotification } = ChatState();

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }),
    [user?.token],
  );

  const startTyping = () => {
    if (!socketConnected || !selectedChat?._id || !socketRef.current) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 3000);
  };

  const handleEmojiClick = (emojiData) => {
    const selectedEmoji = emojiData?.emoji || "";

    if (!selectedEmoji) return;

    setNewMessage((prev) => prev + selectedEmoji);
    startTyping();
  };

  const fetchMessages = async () => {
    if (!selectedChat?._id || !user?.token) return;

    try {
      setLoading(true);
      setMessageError("");

      const { data } = await axios.get(
        `${API_BASE_URL}/api/message/${selectedChat._id}`,
        authConfig,
      );

      setMessages(data);

      if (socketRef.current) {
        socketRef.current.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      setMessageError(
        error?.response?.data?.message || "Failed to load messages",
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
      setShowEmojiPicker(false);
      setTyping(false);

      if (socketRef.current) {
        socketRef.current.emit("stop typing", selectedChat._id);
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
        },
      );

      if (socketRef.current) {
        socketRef.current.emit("new message", data);
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    } catch (error) {
      setNewMessage(messageToSend);
      setMessageError(
        error?.response?.data?.message || "Failed to send message",
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

  const typingHandler = (event) => {
    setNewMessage(event.target.value);
    startTyping();
  };

  useEffect(() => {
    if (!user?._id) {
      console.log("NO USER FOUND FOR SOCKET");
      return;
    }

    console.log("TRYING SOCKET CONNECTION FOR USER:", user._id);

    socketRef.current = io(ENDPOINT, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on("connect", () => {
      console.log("FRONTEND SOCKET CONNECTED:", socketRef.current.id);
      socketRef.current.emit("setup", user);
    });

    socketRef.current.on("connected", () => {
      console.log("SOCKET SETUP COMPLETED");
      setSocketConnected(true);
    });

    socketRef.current.on("connect_error", (error) => {
      console.log("FRONTEND SOCKET CONNECT ERROR:", error.message);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("FRONTEND SOCKET DISCONNECTED:", reason);
      setSocketConnected(false);
    });

    socketRef.current.on("typing", () => setIsTyping(true));
    socketRef.current.on("stop typing", () => setIsTyping(false));

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("connected");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("disconnect");
      socketRef.current?.off("typing");
      socketRef.current?.off("stop typing");
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [user?._id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
    selectedChatCompareRef.current = selectedChat;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    if (!socketConnected || !socketRef.current) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (!newMessageReceived?.chat?._id) return;

      const currentChat = selectedChatCompareRef.current;

      if (!currentChat || currentChat._id !== newMessageReceived.chat._id) {
        setNotification((prevNotifications = []) => {
          const alreadyExists = prevNotifications.some(
            (notif) => notif._id === newMessageReceived._id,
          );

          if (alreadyExists) return prevNotifications;

          return [newMessageReceived, ...prevNotifications];
        });

        setFetchAgain?.((prev) => !prev);
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socketRef.current.on("message received", handleMessageReceived);

    return () => {
      socketRef.current?.off("message received", handleMessageReceived);
    };
  }, [socketConnected, setNotification, setFetchAgain]);

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
              textAlign="center"
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
              <Box className="messages" flex="1" overflowY="auto">
                <ScrollableChat messages={messages} />
              </Box>
            )}

            {isTyping && (
              <Box width="70px" mb={2}>
                <LottiePlayer
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                />
              </Box>
            )}

            <Box
              display="flex"
              alignItems="center"
              gap={2}
              mt={3}
              position="relative"
            >
              {showEmojiPicker && (
                <Box position="absolute" bottom="50px" left="0" zIndex="999">
                  <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
                </Box>
              )}

              <IconButton
                aria-label="Add emoji"
                bg="gray.200"
                color="black"
                _hover={{ bg: "gray.300" }}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <FaSmile />
              </IconButton>

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
