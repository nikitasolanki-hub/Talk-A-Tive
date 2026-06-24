import { Box } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import Mychats from "../components/Mychats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();

  return (
    <Box w="100%">
      {user && <SideDrawer />}

      {user && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="stretch"
          w="100%"
          h="91.5vh"
          p="10px"
        >
          {user && <Mychats/>}
          {user && <ChatBox/>}
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;