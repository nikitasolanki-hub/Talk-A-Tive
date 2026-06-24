import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Image,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";

const DEFAULT_PROFILE_PIC =
  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const ProfileModal = ({ user, children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  if (!user) return null;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const profilePic = user.pic || DEFAULT_PROFILE_PIC;

  return (
    <>
      {children ? (
        <Box
          as="span"
          display="inline-flex"
          cursor="pointer"
          onClick={() => setOpen(true)}
        >
          {children}
        </Box>
      ) : !isControlled ? (
        <IconButton
          aria-label="View Profile"
          colorPalette="blue"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <FaEye />
        </IconButton>
      ) : null}

      <Dialog.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" />

          <Dialog.Positioner>
            <Dialog.Content
              maxW="lg"
              borderRadius="xl"
              overflow="hidden"
              bg="white"
            >
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
                  textAlign="center"
                >
                  {user.name}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack gap={5} py={6}>
                  <Image
                    src={profilePic}
                    alt={user.name || "User profile"}
                    boxSize="150px"
                    borderRadius="full"
                    objectFit="cover"
                    border="4px solid"
                    borderColor="blue.200"
                  />

                  <Box textAlign="center">
                    <Text color="gray.500" fontSize="sm">
                      Email
                    </Text>

                    <Text
                      fontSize={{ base: "lg", md: "xl" }}
                      fontFamily="Work sans"
                      color="black"
                      fontWeight="medium"
                    >
                      {user.email}
                    </Text>
                  </Box>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="blue.100">
                <Button colorPalette="blue" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ProfileModal;