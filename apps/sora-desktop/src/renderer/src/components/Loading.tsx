import wiseWord from "petuah/petuah.json";

import { Box, Heading, Text, HStack, Spinner, Flex } from "@chakra-ui/react";
import { useMemo } from "react";

const Loading = ({ headingText }: { headingText: string }) => {
  const masterOogway = useMemo(() => {
    const randomIndex = new Uint8Array(1);
    crypto.getRandomValues(randomIndex);

    const index = randomIndex[0] % wiseWord.length;

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

export default Loading;
