import { useState } from "react";
import {
  Box,
  Button,
  Text,
  Input,
  Drawer,
  Menu,
  Portal,
  Spinner,
  Badge,
  Image,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaBell,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";

const API_BASE_URL = "http://localhost:5000";

const SideDrawer = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [message, setMessage] = useState("");

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const safeNotifications = Array.isArray(notification) ? notification : [];

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setMessage("Please enter something in search");
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
        `${API_BASE_URL}/api/user?search=${search}`,
        config
      );

      setSearchResult(data);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load search results"
      );
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      setMessage("");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { userId },
        config
      );

      if (!chats?.find((chat) => chat._id === data._id)) {
        setChats([data, ...(chats || [])]);
      }

      setSelectedChat(data);
      setIsDrawerOpen(false);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Error fetching the chat");
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        width="100%"
        px={4}
        py={2}
        borderWidth="1px"
        boxShadow="sm"
      >
        <Button
          variant="ghost"
          colorPalette="blue"
          onClick={() => setIsDrawerOpen(true)}
        >
          <FaSearch />

          <Text display={{ base: "none", md: "flex" }} ml={2}>
            Search User
          </Text>
        </Button>

        <Text
          fontSize="2xl"
          fontFamily="Work sans"
          fontWeight="bold"
          color="blue.700"
        >
          Talk-A-Tive
        </Text>

        <Box display="flex" alignItems="center" gap={3}>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" position="relative">
                <FaBell />

                {safeNotifications.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorPalette="red"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {safeNotifications.length}
                  </Badge>
                )}
              </Button>
            </Menu.Trigger>

            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {safeNotifications.length === 0 ? (
                    <Menu.Item value="no-notification">
                      No New Messages
                    </Menu.Item>
                  ) : (
                    safeNotifications.map((notif) => (
                      <Menu.Item
                        key={notif._id}
                        value={notif._id}
                        onClick={() => {
                          if (!notif?.chat) return;

                          setSelectedChat(notif.chat);

                          setNotification((prevNotifications = []) =>
                            prevNotifications.filter(
                              (n) => n._id !== notif._id
                            )
                          );
                        }}
                      >
                        {notif?.chat?.isGroupChat
                          ? `New Message in ${notif.chat.chatName}`
                          : notif?.chat?.users
                          ? `New Message from ${getSender(
                              user,
                              notif.chat.users
                            )}`
                          : "New Message"}
                      </Menu.Item>
                    ))
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger asChild>
              <Button bg="white" variant="outline">
                <Box display="flex" alignItems="center" gap={2}>
                  <Image
                    src={user?.pic}
                    alt={user?.name || "Profile"}
                    boxSize="30px"
                    borderRadius="full"
                    objectFit="cover"
                  />
                  <FaChevronDown />
                </Box>
              </Button>
            </Menu.Trigger>

            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    value="profile"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <FaUser />
                      My Profile
                    </Box>
                  </Menu.Item>

                  <Menu.Item value="logout" onClick={logoutHandler}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <FaSignOutAlt />
                      Logout
                    </Box>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          <ProfileModal
            user={user}
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
          />
        </Box>
      </Box>

      <Drawer.Root
        open={isDrawerOpen}
        placement="start"
        onOpenChange={(details) => setIsDrawerOpen(details.open)}
      >
        <Portal>
          <Drawer.Backdrop />

          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header borderBottomWidth="1px">
                <Drawer.Title>Search Users</Drawer.Title>
              </Drawer.Header>

              <Drawer.Body>
                <Box display="flex" gap={2} pb={3}>
                  <Input
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    color="black"
                    _placeholder={{ color: "gray.500" }}
                  />

                  <Button colorPalette="blue" onClick={handleSearch}>
                    Go
                  </Button>
                </Box>

                {message && (
                  <Text color="red.500" fontSize="sm" mb={3}>
                    {message}
                  </Text>
                )}

                {loading ? (
                  <ChatLoading />
                ) : (
                  searchResult?.map((searchedUser) => (
                    <UserListItem
                      key={searchedUser._id}
                      user={searchedUser}
                      handleFunction={() => accessChat(searchedUser._id)}
                    />
                  ))
                )}

                {loadingChat && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Spinner color="blue.500" />
                  </Box>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
};

export default SideDrawer;