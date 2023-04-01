import { Box, Button, Text, HStack, Heading } from "@chakra-ui/react";

const ErrorScanner = ({
  setInvalidQr,
}: {
  setInvalidQr: (invalid: boolean) => void;
}) => {
  return (
    <HStack h={"100vh"} justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        display="flex"
        flexDirection="column"
        boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
        alignItems="center"
        justifyContent="center"
      >
        <Heading as="h2" size="3xl">
          QR Tidak Valid!
        </Heading>

        <Box margin="1.3em" style={{ textAlign: "center" }}>
          <Text fontSize="xl">QR Code yang anda tunjukkan tidak valid.</Text>
          <Text fontSize="xl">
            Mohon hubungi panitia untuk memperbaiki masalah ini.
          </Text>
        </Box>

        <Button colorScheme="yellow" onClick={() => setInvalidQr(false)}>
          Coba Scan Ulang
        </Button>
      </Box>
    </HStack>
  );
};

export default ErrorScanner;
