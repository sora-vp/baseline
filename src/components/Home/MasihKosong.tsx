import { Box, Container, Divider, Text } from "@chakra-ui/react";

export const MasihKosong = () => (
  <Container>
    <Box p={4} borderWidth="1px" mt="6" borderRadius="lg">
      <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
        Tidak Ada Data KANDIDAT
      </Text>
      <Divider orientation="horizontal" mt="1" mb="1" />
      <Text>
        Tidak ada data kandidat yang ada, mohon hubungi admin untuk menambahkan
        data kandidat.
      </Text>
    </Box>
  </Container>
);
