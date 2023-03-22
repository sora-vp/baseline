import { Box, HStack, Heading, Text } from "@chakra-ui/react";

const SuccessScan: React.FC = () => {
  return (
    <HStack h="100vh" justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        display="flex"
        boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
        alignItems="center"
        justifyContent="center"
      >
        <HStack
          flexDirection="column"
          h="100%"
          w="80%"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <Heading as="h3" size="2xl" color="green.400" marginBottom={"5"}>
            Berhasil Absen !
          </Heading>
          <Text fontSize="2xl">
            Silahkan menuju ke komputer pemilihan dan gunakan hak suara anda!
          </Text>
        </HStack>
      </Box>
    </HStack>
  );
};

export default SuccessScan;
