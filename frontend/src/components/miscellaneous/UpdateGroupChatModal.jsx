import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  IconButton,
  Input,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import { IoEye } from "react-icons/io5";
import axios from "axios";

import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ;

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const showError = (message) => {
    alert(message);
  };

  const getAuthConfig = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });

  const handleSearch = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_BASE_URL}/user?search=${query}`,
        getAuthConfig()
      );

      setSearchResult(data);
    } catch  {
      showError("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName.trim()) return;

    try {
      setRenameLoading(true);

      const { data } = await axios.put(
        `${API_BASE_URL}/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        getAuthConfig()
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to rename group");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      showError("User already exists in this group");
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      showError("Only group admin can add users");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        `${API_BASE_URL}/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        getAuthConfig()
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

const handleRemove = async (userToRemove) => {
  if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
    showError("Only admin can remove someone");
    return;
  }

  try {
    const { data } = await axios.put(
      `${API_BASE_URL}/chat/groupremove`,
      {
        chatId: selectedChat._id,
        userId: userToRemove._id,
      },
      getAuthConfig()
    );

    setSelectedChat(data.updatedChat);
    setFetchAgain((prev) => !prev);
    fetchMessages();
  } catch (error) {
    showError(error?.response?.data?.message || "Failed to remove user");
  }
};

  if (!selectedChat) return null;

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        onClick={() => setOpen(true)}
        aria-label="Update group chat"
      >
        <IoEye />
      </IconButton>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title
                  fontSize="35px"
                  fontFamily="Work sans"
                  textAlign="center"
                  width="100%"
                >
                  {selectedChat.chatName}
                </Dialog.Title>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      admin={selectedChat.groupAdmin._id}
                      handleFunction={() => handleRemove(u)}
                    />
                  ))}
                </Box>

                <Box width="100%" display="flex" mb={3}>
                  <Input
                    placeholder="Chat Name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />

                  <Button
                    variant="solid"
                    colorPalette="teal"
                    ml={1}
                    loading={renameLoading}
                    onClick={handleRename}
                  >
                    Update
                  </Button>
                </Box>

                <Field.Root width="100%" mb={3}>
                  <Input
                    placeholder="Add user to group"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </Field.Root>

                {loading ? (
                  <Spinner size="lg" />
                ) : (
                  searchResult?.slice(0, 4).map((searchedUser) => (
                    <UserListItem
                      key={searchedUser._id}
                      user={searchedUser}
                      handleFunction={() => handleAddUser(searchedUser)}
                    />
                  ))
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  onClick={() => handleRemove(user)}
                  colorPalette="red"
                  loading={loading}
                >
                  Leave Group
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default UpdateGroupChatModal;