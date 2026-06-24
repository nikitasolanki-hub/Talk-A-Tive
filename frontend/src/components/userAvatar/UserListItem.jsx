import { Box, Image, Text } from "@chakra-ui/react";

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/dq17pkuwg/image/upload/v1782277226/20250619_151950_ef57eu.jpg";

const UserListItem = ({ user, handleFunction }) => {
  if (!user) return null;

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="blue.50"
      _hover={{
        bg: "blue.500",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      gap={3}
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
      transition="0.2s ease"
    >
      <Image
        src={user.pic || DEFAULT_PROFILE_PIC}
        alt={user.name}
        boxSize="38px"
        borderRadius="full"
        objectFit="cover"
        border="2px solid"
        borderColor="blue.200"
      />

      <Box overflow="hidden">
        <Text fontWeight="semibold" fontSize="sm">
          {user.name}
        </Text>

        <Text fontSize="xs">
          <Text as="span" fontWeight="bold">
            Email:{" "}
          </Text>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;