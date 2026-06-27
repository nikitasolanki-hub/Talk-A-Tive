import { Avatar, Box, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import ScrollableFeed from "react-scrollable-feed";

import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/dq17pkuwg/image/upload/v1782277226/20250619_151950_ef57eu.jpg";

const ScrollableChat = ({ messages = [] }) => {
  const { user } = ChatState();
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length]);

  if (!user?._id) return null;

  return (
    <ScrollableFeed forceScroll={true}>
      {messages.map((message, index) => {
        if (message.isSystemMessage) {
          return (
            <Box
              key={message._id || index}
              display="flex"
              justifyContent="center"
              width="100%"
              my={2}
            >
              <Text
                fontSize="xs"
                color="gray.600"
                bg="gray.200"
                px={3}
                py={1}
                borderRadius="full"
                textAlign="center"
              >
                {message.content}
              </Text>
            </Box>
          );
        }

        const senderId = message.sender?._id;
        const isOwnMessage = senderId === user._id;

        const shouldShowAvatar =
          isSameSender(messages, message, index, user._id) ||
          isLastMessage(messages, index, user._id);

        return (
          <Box
            key={message._id || index}
            display="flex"
            alignItems="flex-start"
            width="100%"
          >
            {shouldShowAvatar && (
              <ProfileModal user={message.sender}>
                <Avatar.Root
                  size="sm"
                  mt="7px"
                  mr={1}
                  cursor="pointer"
                  title={message.sender?.name || "User"}
                >
                  <Avatar.Image
                    src={message.sender?.pic || DEFAULT_PROFILE_PIC}
                    alt={message.sender?.name || "User"}
                  />
                  <Avatar.Fallback name={message.sender?.name || "User"} />
                </Avatar.Root>
              </ProfileModal>
            )}

            <Box
              bg={isOwnMessage ? "#BEE3F8" : "#B9F5D0"}
              color="black"
              ml={isSameSenderMargin(messages, message, index, user._id)}
              mt={isSameUser(messages, message, index) ? 1 : 3}
              borderRadius="20px"
              px="15px"
              py="7px"
              maxWidth="75%"
              wordBreak="break-word"
              whiteSpace="pre-wrap"
            >
              <Text fontSize="sm">{message.content || ""}</Text>
            </Box>
          </Box>
        );
      })}

      <Box ref={bottomRef} height="1px" />
    </ScrollableFeed>
  );
};

export default ScrollableChat;