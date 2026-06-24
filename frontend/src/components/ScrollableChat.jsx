import { Avatar, Box, Span } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages?.map((m, i) => (
        <Box display="flex" key={m._id}>
          {(isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id)) && (
            <ProfileModal user={m.sender}>
              <Avatar.Root
                size="sm"
                mt="7px"
                mr={1}
                cursor="pointer"
                title={m.sender.name}
              >
                <Avatar.Image src={m.sender.pic} alt={m.sender.name} />
                <Avatar.Fallback name={m.sender.name} />
              </Avatar.Root>
            </ProfileModal>
          )}

          <Span
            bg={m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}
            ml={isSameSenderMargin(messages, m, i, user._id)}
            mt={isSameUser(messages, m, i) ? 1 : 3}
            borderRadius="20px"
            px="15px"
            py="5px"
            maxW="75%"
          >
            {m.content}
          </Span>
        </Box>
      ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;