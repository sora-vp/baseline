import {
  useColorModeValue,
  Button,
  Box,
  Text,
  Stack,
  VStack,
  HStack,
  Container,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";

import { getBaseUrl } from "@/lib/utils";
import { ssrCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import { formatTime } from "@/lib/utils";
import { useUser, type UserType } from "@/lib/hooks";

import Sidebar from "@/component/Sidebar";

type DashboardType = {
  userFallback: UserType;
} & commonComponentInterface;

const Admin = ({ userFallback }: DashboardType) => {
  const [user] = useUser({ fallbackData: userFallback });

  return (
    <>
      <Head>
        <title>Dashboard Admin</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Dashboard Admin
          </Text>
        </HStack>

        <HStack>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
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
                <NextLink href="/admin/ubah/password" passHref>
                  <Button
                    as={"a"}
                    borderRadius="md"
                    bg="red"
                    color="white"
                    _hover={{
                      bg: "red.800",
                    }}
                  >
                    Ganti Password
                  </Button>
                </NextLink>
                <NextLink href="/admin/ubah/nama" passHref>
                  <Button
                    as={"a"}
                    borderRadius="md"
                    bg="green.600"
                    color="white"
                    _hover={{
                      bg: "green.800",
                    }}
                  >
                    Ganti Nama
                  </Button>
                </NextLink>
              </Stack>
            </Container>
          </Box>
        </HStack>
      </VStack>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardType> = async ({
  req,
  res,
}) => {
  const baseUrl = getBaseUrl();
  await ssrCallback({ req, res });

  const response = await fetch(`${baseUrl}/api/user`, {
    credentials: "include",
    headers: {
      Cookie: req.headers.cookie ? req.headers.cookie : "",
    },
  });
  const { user } = await response.json();

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/login",
      },
    };
  }

  return {
    props: {
      userFallback: user,
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export default Sidebar(Admin);
