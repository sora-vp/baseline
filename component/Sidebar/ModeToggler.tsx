import { useColorMode, VStack, Flex, Button, Icon } from "@chakra-ui/react";

import { BsMoonFill, BsSun } from "react-icons/bs";

const ModeToggler = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <VStack
      h={"50%"}
      justifyContent="center"
      style={{ marginTop: "5.5rem", alignItems: "flex-start" }}
    >
      <Flex align="center" p="1" mx="4" role="group">
        <Button onClick={toggleColorMode}>
          <Icon fontSize="16" as={colorMode === "light" ? BsSun : BsMoonFill} />
        </Button>
      </Flex>
    </VStack>
  );
};

export default ModeToggler;
