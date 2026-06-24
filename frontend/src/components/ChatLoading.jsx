import { Skeleton, Stack } from "@chakra-ui/react";

const ChatLoading = () => {
  return (
    <Stack gap={3}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton key={index} height="45px" borderRadius="md" />
      ))}
    </Stack>
  );
};

export default ChatLoading;