import { Box, HStack, Heading, Text } from "@chakra-ui/react";

const InvalidCandidate = () => (
  <HStack h={"100vh"} justifyContent="center">
    <Box
      borderWidth="2px"
      borderRadius="lg"
      w="85%"
      h="90%"
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      }}
      alignItems="center"
      justifyContent="center"
    >
      <Heading p={".6em"} color="red.500">
        Profil Pemilihan Tidak Valid
      </Heading>

      <Text fontSize="1.3em">
        Sekurang-kurangnya sebuah pemilihan harus memiliki dua kandidat.
      </Text>
      <Text fontSize="1.3em">
        Mohon hubungi panitia untuk memperbaiki masalah ini.
      </Text>
    </Box>
  </HStack>
);

export default InvalidCandidate;
