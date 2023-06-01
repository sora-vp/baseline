import { Box, HStack, Heading } from "@chakra-ui/react";

export const BerhasilMemilihDanCapJari = () => (
  <HStack h={"100vh"} justifyContent="center">
    <Box
      borderWidth="2px"
      borderRadius="lg"
      w="85%"
      h="90%"
      backgroundColor="green.500"
      style={{
        display: "flex",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        gap: "1em",
      }}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Heading as="h1" size="4xl" fontSize="5rem" color={"white"}>
        Data berhasil terekam!
      </Heading>
      <Heading as="h2" size="xl" color={"white"} fontWeight={"regular"}>
        Silahkan keluar dari bilik suara dan melakukan cap jari.
      </Heading>
    </Box>
  </HStack>
);
