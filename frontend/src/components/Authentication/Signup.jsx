import { useState } from "react";
import { Box, Button, Input, Stack, Text, Image } from "@chakra-ui/react";
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
    pic: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadPicture = async (file) => {
    if (!file) {
      setMessage("Please select an image");
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setMessage("Only JPG and PNG images are allowed");
      return;
    }

    try {
      setPicLoading(true);
      setMessage("");

      const imageData = new FormData();
      imageData.append("file", file);
      imageData.append("upload_preset", "chat-app");
      imageData.append("cloud_name", "piyushproj");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/piyushproj/image/upload",
        {
          method: "POST",
          body: imageData,
        }
      );

      const data = await response.json();

      if (!data.url) {
        throw new Error("Image upload failed");
      }

      setFormData((prev) => ({
        ...prev,
        pic: data.url,
      }));

      setPicLoading(false);
    } catch {
      setPicLoading(false);
      setMessage("Image upload failed");
    }
  };

  const submitHandler = async () => {
    const { name, email, password, confirmPassword, pic } = formData;

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
        pic,
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

        <Box>
          <Text mb={1} color="blue.700" fontWeight="medium">
            Profile Picture
          </Text>

          <Input
            type="file"
            accept="image/png, image/jpeg"
            p={1}
            onChange={(e) => uploadPicture(e.target.files[0])}
          />

          {picLoading && (
            <Text mt={2} color="blue.600" fontSize="sm">
              Uploading image...
            </Text>
          )}

          {formData.pic && (
            <Box mt={3} display="flex" alignItems="center" gap={3}>
              <Image
                src={formData.pic}
                alt="Profile Preview"
                boxSize="55px"
                borderRadius="full"
                objectFit="cover"
                border="2px solid"
                borderColor="blue.200"
              />
              <Text color="green.600" fontSize="sm" fontWeight="medium">
                Image uploaded successfully
              </Text>
            </Box>
          )}
        </Box>

        <Button
          colorPalette="blue"
          width="100%"
          onClick={submitHandler}
          disabled={loading || picLoading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </Stack>
    </Box>
  );
};

export default Signup;