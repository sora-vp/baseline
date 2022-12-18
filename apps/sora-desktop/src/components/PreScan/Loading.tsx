import { Box, Text, HStack, Spinner } from "@chakra-ui/react";

export const Loading = () => (
  <HStack h={"100vh"} justifyContent="center">
    <Box
      borderWidth="2px"
      borderRadius="lg"
      w="85%"
      h="90%"
      style={{
        display: "flex",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      }}
      alignItems="center"
      justifyContent="center"
    >
      <Spinner thickness="4px" size="xl" />
      <Text ml="2em">Mengambil data terbaru...</Text>
    </Box>
  </HStack>
);
