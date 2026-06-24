import { useRef, useState } from "react";
import { Box, Button, Input, Stack, Text, Image } from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/dq17pkuwg/image/upload/v1782277226/20250619_151950_ef57eu.jpg";

const CLOUDINARY_CLOUD_NAME = "dq17pkuwg";
const CLOUDINARY_UPLOAD_PRESET = "chat-app";

const Signup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: DEFAULT_PROFILE_PIC,
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
      imageData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: imageData,
        }
      );

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      setFormData((prev) => ({
        ...prev,
        pic: data.secure_url,
      }));
    } catch (error) {
      setMessage(error.message || "Image upload failed");
    } finally {
      setPicLoading(false);
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

      navigate("/chats");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong during signup"
      );
    } finally {
      setLoading(false);
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
            color="black"
            _placeholder={{ color: "gray.500" }}
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
            color="black"
            _placeholder={{ color: "gray.500" }}
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
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            display="none"
            color="black"
            _placeholder={{ color: "gray.500" }}
            onChange={(e) => uploadPicture(e.target.files[0])}
          />

          <Box
            border="2px dashed"
            borderColor="blue.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            cursor="pointer"
            bg="blue.50"
            _hover={{ bg: "blue.100", borderColor: "blue.500" }}
            onClick={() => fileInputRef.current.click()}
          >
            <Box
              display="flex"
              justifyContent="center"
              color="blue.600"
              fontSize="28px"
              mb={2}
            >
              <FaCloudUploadAlt />
            </Box>

            <Text color="blue.700" fontWeight="medium">
              Click to upload profile picture
            </Text>

            <Text color="gray.500" fontSize="sm">
              PNG or JPG only
            </Text>
          </Box>

          {picLoading && (
            <Text mt={2} color="blue.600" fontSize="sm">
              Uploading image...
            </Text>
          )}

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

            <Text
              color={
                formData.pic === DEFAULT_PROFILE_PIC ? "blue.600" : "green.600"
              }
              fontSize="sm"
              fontWeight="medium"
            >
              {formData.pic === DEFAULT_PROFILE_PIC
                ? "Default image will be used"
                : "Image uploaded successfully"}
            </Text>
          </Box>
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