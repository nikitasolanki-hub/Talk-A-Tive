import { Badge } from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize="12px"
      colorPalette="purple"
      cursor="pointer"
      onClick={handleFunction}
      display="inline-flex"
      alignItems="center"
      gap={1}
    >
      {user.name}
      {admin === user._id && <span> (Admin)</span>}
      <IoClose />
    </Badge>
  );
};

export default UserBadgeItem;