import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";

import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [message, setMessage] = useState("");

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const fetchChats = async () => {
    if (!user?.token) return;

    try {
      setMessage("");

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

   const { data } = await axios.get(`${API_BASE_URL}/api/chat`, config);

      setChats(data);
    } catch (error) {
      console.log("FETCH CHATS ERROR:", error?.response?.data || error.message);
      setMessage("Failed to load chats");
    }
  };

  const getUnreadCount = (chat) => {
    return (
      notification?.filter((notif) => notif.chat?._id === chat._id).length || 0
    );
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);

    setNotification((prevNotifications = []) =>
      prevNotifications.filter((notif) => notif.chat?._id !== chat._id)
    );
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedUser(storedUser);

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain, user?.token]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      height="100%"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "24px", md: "26px", lg: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        color="black"
      >
        <Text fontWeight="bold">My Chats</Text>

        <GroupChatModal>
          <Button
            display="flex"
            alignItems="center"
            gap={2}
            fontSize={{ base: "13px", md: "12px", lg: "15px" }}
            bg="blue.800"
            color="white"
            _hover={{ bg: "blue.900" }}
            _active={{ bg: "blue.950" }}
            cursor="pointer"
            size="sm"
          >
            New Group
            <FaPlus />
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="gray.50"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {message && (
          <Text color="red.500" fontSize="sm" mb={2}>
            {message}
          </Text>
        )}

        {chats ? (
          <Stack overflowY="auto" gap={2}>
            {chats.map((chat) => {
              const isSelected = selectedChat?._id === chat._id;
              const unreadCount = getUnreadCount(chat);
              const unread = unreadCount > 0;

              return (
                <Box
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  cursor="pointer"
                  bg={isSelected ? "blue.500" : "blue.50"}
                  color={isSelected ? "white" : "black"}
                  _hover={{
                    bg: isSelected ? "blue.500" : "blue.100",
                  }}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  transition="0.2s ease"
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                  >
                    <Text fontWeight={unread ? "bold" : "semibold"}>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>

                    {unread && (
                      <Box
                        minW="22px"
                        h="22px"
                        px={2}
                        borderRadius="full"
                        bg={isSelected ? "white" : "blue.600"}
                        color={isSelected ? "blue.600" : "white"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {unreadCount}
                      </Box>
                    )}
                  </Box>

                  {chat.latestMessage && (
                    <Text
                      fontSize="xs"
                      mt={1}
                      fontWeight={unread ? "bold" : "normal"}
                    >
                      <Text
                        as="span"
                        fontWeight={unread ? "bold" : "semibold"}
                      >
                        {chat.latestMessage.sender.name}:{" "}
                      </Text>

                      {chat.latestMessage.content.length > 50
                        ? `${chat.latestMessage.content.substring(0, 51)}...`
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;