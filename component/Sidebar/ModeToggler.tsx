import { useColorMode, VStack, Flex, Button, Icon } from "@chakra-ui/react";
import { BsMoonFill, BsSun } from "react-icons/bs";

type ModeTogglerType = {
  height: number;
  clientRect: DOMRect | null;
};

const ModeToggler = ({ height, clientRect }: ModeTogglerType) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <VStack
      h={height - (clientRect ? clientRect?.bottom : 0)}
      justifyContent="end"
      style={{
        alignItems: "flex-start",
      }}
    >
      <Flex align="center" p="1" mx="4" role="group">
        <Button
          onClick={(e) => {
            (e.target as HTMLButtonElement).blur();
            toggleColorMode();
          }}
          style={{ marginBottom: "15px" }}
        >
          <Icon fontSize="16" as={colorMode === "light" ? BsSun : BsMoonFill} />
        </Button>
      </Flex>
    </VStack>
  );
};

export default ModeToggler;
