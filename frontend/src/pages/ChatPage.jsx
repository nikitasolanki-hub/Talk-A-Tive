import { useState } from "react";
import { Box } from "@chakra-ui/react";

import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <Box width="100%">
      {user && <SideDrawer />}

      {user && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="stretch"
          width="100%"
          height="91.5vh"
          p="10px"
          gap={3}
        >
          <MyChats fetchAgain={fetchAgain} />

          <ChatBox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;