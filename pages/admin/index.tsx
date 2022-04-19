import {
  Box,
  Button,
  Text,
  Stack,
  VStack,
  HStack,
  Container,
} from "@chakra-ui/react";
import { useEffect } from "react";

import { formatTime } from "@/lib/utils";
import { useUser } from "@/lib/hooks";
import Router from "next/router";

import Sidebar from "@/component/Sidebar";

import type { NextPage } from "next";

const Admin: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <VStack align="stretch">
        <HStack mb={"10px"}>
          <Text fontWeight="500" fontSize="5xl">
            Dashboard Admin
          </Text>
        </HStack>

        <HStack>
          <Box
            bg="white"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            h={"43vh"}
          >
            <Container mx={7} my={7}>
              <Text fontWeight={500} fontSize={"30px"} mb={5}>
                Informasi Akun Anda
              </Text>

              <Text>Nama: {user?.username || "N/A"}</Text>
              <Text>Email: {user?.email || "N/A"}</Text>
              <Text>
                Tanggal Pendaftaran:{" "}
                {(user?.date && formatTime(user.date)) || "N/A"}
              </Text>

              <Stack spacing={2} direction="row" align="center" mt={5}>
                <Button size="md" colorScheme="teal">
                  Ganti Password
                </Button>
                <Button size="md" colorScheme="teal">
                  Ganti Nama
                </Button>
              </Stack>
            </Container>
          </Box>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default Admin;