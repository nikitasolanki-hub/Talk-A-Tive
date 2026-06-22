import { useState } from "react";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { data } = await axios.post("http://localhost:5000/api/user", {
        name,
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);
      navigate("/chats");
    } catch (error) {
      setLoading(false);
      setMessage(
        error.response?.data?.message || "Something went wrong during signup"
      );
    }
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
            Name
          </Text>
          <Input
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
        </Box>

        <Box>
          <Text mb={1} color="blue.700" fontWeight="medium">
            Email
          </Text>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
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

        <Box>
          <Text mb={1} color="blue.700" fontWeight="medium">
            Confirm Password
          </Text>

          <Box position="relative">
            <Input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </Stack>
    </Box>
  );
};

export default Signup;