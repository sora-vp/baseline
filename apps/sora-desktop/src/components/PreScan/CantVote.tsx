import { Box, Text, HStack, Heading } from "@chakra-ui/react";

export const CantVote: React.FC = () => (
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
      <Heading size="lg" fontSize="50px" fontWeight="semibold" color="gray.900">
        Tidak <Text color="red">Di izinkan</Text>
        Untuk memilih!
      </Heading>
    </Box>
  </HStack>
);
