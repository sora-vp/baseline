import { Box, HStack, Heading } from "@chakra-ui/react";

const ScanningError = ({ message }: { message: string }) => {
  return (
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
          Gagal Absen!
        </Heading>
        <Heading
          mt={2}
          size="xl"
          color="white"
          fontWeight="regular"
          maxW="22em"
          textAlign="center"
        >
          {message}
        </Heading>
      </Box>
    </HStack>
  );
};

export default ScanningError;
