import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Input,
  Portal,
  Text,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";

import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

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

  const handleGroup = (userToAdd) => {
    const alreadyAdded = selectedUsers.some((u) => u._id === userToAdd._id);

    if (alreadyAdded) {
      setMessage("User already added");
      return;
    }

    setSelectedUsers((prev) => [...prev, userToAdd]);
    setMessage("");
  };

  const handleDelete = (userToDelete) => {
    setSelectedUsers((prev) =>
      prev.filter((selectedUser) => selectedUser._id !== userToDelete._id)
    );
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

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${query}`,
        config
      );

      setSearchResult(data);
    } catch  {
      setMessage("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName.trim()) {
      setMessage("Please enter group chat name");
      return;
    }

    if (selectedUsers.length < 2) {
      setMessage("Please add at least 2 users");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...(chats || [])]);

      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
      setOpen(false);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to create group chat"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Box as="span" cursor="pointer" onClick={() => setOpen(true)}>
        {children}
      </Box>

      <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />

          <Dialog.Positioner>
            <Dialog.Content maxW="lg" bg="white" borderRadius="xl">
              <Dialog.Header
                display="flex"
                justifyContent="center"
                borderBottomWidth="1px"
                borderColor="blue.100"
              >
                <Dialog.Title
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontFamily="Work sans"
                  color="blue.700"
                  fontWeight="bold"
                >
                  Create Group Chat
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Box display="flex" flexDirection="column" gap={4}>
                  {message && (
                    <Text color="red.500" fontSize="sm" fontWeight="medium">
                      {message}
                    </Text>
                  )}

                  <Box>
                    <Text mb={1} color="blue.700" fontWeight="medium">
                      Group Name
                    </Text>
                    <Input
                      placeholder="Enter group chat name"
                      value={groupChatName}
                      onChange={(e) => setGroupChatName(e.target.value)}
                      color="black"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </Box>

                  <Box>
                    <Text mb={1} color="blue.700" fontWeight="medium">
                      Add Users
                    </Text>
                    <Input
                      placeholder="Search users by name or email"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      color="black"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {selectedUsers.map((selectedUser) => (
                      <UserBadgeItem
                        key={selectedUser._id}
                        user={selectedUser}
                        handleFunction={() => handleDelete(selectedUser)}
                      />
                    ))}
                  </Box>

                  <Box>
                    {loading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <Spinner color="blue.500" />
                      </Box>
                    ) : (
                      searchResult.slice(0, 4).map((searchedUser) => (
                        <UserListItem
                          key={searchedUser._id}
                          user={searchedUser}
                          handleFunction={() => handleGroup(searchedUser)}
                        />
                      ))
                    )}
                  </Box>
                </Box>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="blue.100">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button
                  colorPalette="blue"
                  onClick={handleSubmit}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Chat"}
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