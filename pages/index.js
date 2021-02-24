import { Container, Box, Text, Divider } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container>
      <Box p={4} borderWidth="1px" mt="6" borderRadius="lg">
        <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
          Tidak Ada Data PASLON
        </Text>
        <Divider orientation="horizontal" mt="1" mb="1" />
        <Text>
          Tidak ada data paslon yang ada, mohon hubungi admin untuk menambahkan
          data paslon.
        </Text>
      </Box>
    </Container>
  );
}
