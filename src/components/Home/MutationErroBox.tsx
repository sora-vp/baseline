import { Box, HStack, Heading, Text } from "@chakra-ui/react";

export const MutationErrorBox = ({
  errorMessage,
}: {
  errorMessage: string;
}) => (
  <HStack h={"100vh"} justifyContent="center">
    <Box
      borderWidth="2px"
      borderRadius="lg"
      w="85%"
      h="90%"
      backgroundColor="red.500"
      style={{
        display: "flex",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        gap: "1em",
      }}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Heading as="h2" size="2xl" fontSize="4rem" color="white">
        Gagal dalam menambahkan data!
      </Heading>
      <Heading as="pre" size="xl" color={"white"} fontWeight={"regular"}>
        Beritahu panitia atas masalah ini, pesan error terlampir di bawah.
      </Heading>

      <Text as="pre" fontSize="3xl" color="white">
        {errorMessage}
      </Text>
    </Box>
  </HStack>
);
