import { useColorMode, Flex, Button, Icon } from "@chakra-ui/react";
import { BsMoonFill, BsSun } from "react-icons/bs";

const ModeToggler = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex align="center" p="1" mx="4" role="group">
      <Button
        onClick={(e) => {
          (e.target as HTMLButtonElement).blur();
          toggleColorMode();
        }}
        w="100%"
      >
        <Icon fontSize="16" as={colorMode === "light" ? BsSun : BsMoonFill} />
      </Button>
    </Flex>
  );
};

export default ModeToggler;
