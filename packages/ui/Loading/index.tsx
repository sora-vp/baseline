import { useMemo } from "react";
import { Box, Flex, HStack, Heading, Spinner, Text } from "@chakra-ui/react";

import wiseWord from "@sora/petuah/petuah.json";

export const Loading = ({ headingText }: { headingText: string }) => {
  const masterOogway = useMemo(() => {
    const randomIndex = new Uint8Array(1);
    crypto.getRandomValues(randomIndex);

    const index = Math.floor(Math.random() % wiseWord.length);

    return wiseWord[index];
  }, []);

  return (
    <HStack h={"100vh"} justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        display="flex"
        boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap="2rem"
      >
        <Flex alignItems="center" justifyContent="center">
          <Spinner thickness="4px" size="xl" />
          <Heading as="h3" size="lg" ml="2em">
            {headingText}
          </Heading>
        </Flex>

        <Text width={["35%", "80%"]} fontSize="2xl" textAlign="center">
          {masterOogway}
        </Text>
      </Box>
    </HStack>
  );
};
