import { Container, Box, Text, Tabs } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="md"
      >
        <Text
          fontSize="4xl"
          fontFamily="Work sans"
          color="black"
          fontWeight="bold"
        >
          TALK-A-TIVE
        </Text>
      </Box>

      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs.Root defaultValue="login" variant="enclosed" fitted>
          <Tabs.List
            display="flex"
            w="100%"
            mb="1em"
            bg="blue.200"
            borderRadius="md"
            p={1}
          >
            <Tabs.Trigger
              value="login"
              flex="1"
              justifyContent="center"
              fontSize="lg"
              fontWeight="semibold"
              py={2}
              color="blue.700"
              bg="transparent"
              _selected={{
                bg: "blue.400",
                color: "white",
              }}
            >
              Login
            </Tabs.Trigger>

            <Tabs.Trigger
              value="signup"
              flex="1"
              justifyContent="center"
              fontSize="lg"
              fontWeight="semibold"
              py={2}
              color="blue.700"
              bg="transparent"
              _selected={{
                bg: "blue.400",
                color: "white",
              }}
            >
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="login">
            <Login />
          </Tabs.Content>

          <Tabs.Content value="signup">
            <Signup />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
};

export default HomePage;