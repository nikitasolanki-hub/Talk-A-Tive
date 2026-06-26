import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Spinner,
  Text,
} from "@chakra-ui/react";
import axios from "axios";

import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const API_BASE_URL = "http://localhost:5000";

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const { user, chats, setChats } = ChatState();

  const getAuthConfig = () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    },
  });

  const resetModal = () => {
    setGroupChatName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResult([]);
    setMessage("");
  };

  const handleOpenChange = (details) => {
    setOpen(details.open);

    if (!details.open) {
      resetModal();
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { data } = await axios.get(
        `${API_BASE_URL}/api/user?search=${query}`,
        getAuthConfig()
      );

      setSearchResult(data);
    } catch (error) {
      console.log("SEARCH USER ERROR:", error?.response?.data || error.message);
      setMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupUser = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      setMessage("User already selected");
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
    setMessage("");
  };

  const handleDeleteUser = (userToDelete) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToDelete._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName.trim()) {
      setMessage("Please enter group chat name");
      return;
    }

    if (selectedUsers.length < 2) {
      setMessage("Please select at least 2 users");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const { data } = await axios.post(
        `${API_BASE_URL}/api/chat/group`,
        {
          name: groupChatName.trim(),
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        getAuthConfig()
      );

      setChats([data, ...(chats || [])]);
      setOpen(false);
      resetModal();
    } catch (error) {
      console.log("CREATE GROUP ERROR:", error?.response?.data || error.message);
      setMessage(error?.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Box
        as="span"
        display="inline-flex"
        cursor="pointer"
        onClick={() => setOpen(true)}
      >
        {children}
      </Box>

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Portal>
          <Dialog.Backdrop />

          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title
                  fontSize="30px"
                  fontFamily="Work sans"
                  textAlign="center"
                  width="100%"
                >
                  Create Group Chat
                </Dialog.Title>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                {message && (
                  <Text color="red.500" fontSize="sm" mb={3}>
                    {message}
                  </Text>
                )}

                <Field.Root mb={3}>
                  <Input
                    placeholder="Group chat name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                </Field.Root>

                <Field.Root mb={3}>
                  <Input
                    placeholder="Search users"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </Field.Root>

                <Box display="flex" flexWrap="wrap" width="100%" mb={3}>
                  {selectedUsers.map((selectedUser) => (
                    <UserBadgeItem
                      key={selectedUser._id}
                      user={selectedUser}
                      handleFunction={() => handleDeleteUser(selectedUser)}
                    />
                  ))}
                </Box>

                {loading ? (
                  <Spinner />
                ) : (
                  searchResult?.slice(0, 4).map((searchedUser) => (
                    <UserListItem
                      key={searchedUser._id}
                      user={searchedUser}
                      handleFunction={() => handleGroupUser(searchedUser)}
                    />
                  ))
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  bg="blue.800"
                  color="white"
                  _hover={{ bg: "blue.900" }}
                  _active={{ bg: "blue.950" }}
                  loading={creating}
                  onClick={handleSubmit}
                >
                  Create Chat
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default GroupChatModal;