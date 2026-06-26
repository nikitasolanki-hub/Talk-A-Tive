import { useState } from "react";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://talk-a-tive-8412.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log("LOGIN API URL:", `${API_BASE_URL}/api/user/login`);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/user/login`,
        {
          email,
          password,
        },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);
      navigate("/chats");
    } catch (error) {
      setLoading(false);
      console.log("LOGIN ERROR:", error?.response?.data || error.message);
      setMessage(error.response?.data?.message || "Invalid email or password");
    }
  };

  const fillGuestCredentials = () => {
    setFormData({
      email: "guest@example.com",
      password: "123456",
    });
  };

  return (
    <Box w="100%">
      <Stack gap={4}>
        {message && (
          <Text color="red.500" fontSize="sm" fontWeight="medium">
            {message}
          </Text>
        )}

        <Box>
          <Text mb={1} color="blue.700" fontWeight="medium">
            Email
          </Text>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            color="black"
            _placeholder={{ color: "gray.500" }}
            onChange={handleChange}
          />
        </Box>

        <Box>
          <Text mb={1} color="blue.700" fontWeight="medium">
            Password
          </Text>

          <Box position="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              color="black"
              _placeholder={{ color: "gray.500" }}
              pr="45px"
            />

            <Box
              position="absolute"
              right="12px"
              top="50%"
              transform="translateY(-50%)"
              cursor="pointer"
              color="blue.600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Box>
          </Box>
        </Box>

        <Button
          colorPalette="blue"
          width="100%"
          onClick={submitHandler}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Button
          colorPalette="gray"
          width="100%"
          onClick={fillGuestCredentials}
          variant="outline"
        >
          Guest Login
        </Button>
      </Stack>
    </Box>
  );
};

export default Login;