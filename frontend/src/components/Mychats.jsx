import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";

import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [message, setMessage] = useState("");

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    if (!user?.token) return;

    try {
      setMessage("");

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/chat", config);

      setChats(data);
    } catch  {
      setMessage("Failed to load chats");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedUser(storedUser);

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      h="100%"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "24px", md: "26px", lg: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
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
            fontSize={{ base: "14px", md: "12px", lg: "15px" }}
            colorPalette="blue"
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
        w="100%"
        h="100%"
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

              return (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
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
                  <Text fontWeight="semibold">
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>

                  {chat.latestMessage && (
                    <Text fontSize="xs" mt={1}>
                      <Text as="span" fontWeight="bold">
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