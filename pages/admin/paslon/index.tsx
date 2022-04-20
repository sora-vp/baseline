import {
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Link,
  Text,

  // Table
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
} from "@chakra-ui/react";
import Head from "next/head";
import Router from "next/router";
import NextLink from "next/link";
import { useEffect } from "react";

import { useUser } from "@/lib/hooks";
import Sidebar from "@/component/Sidebar/index";

import type { NextPage } from "next";

const Paslon: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <Head>
        <title>Daftar Paslon</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Paslon
          </Text>
        </HStack>
        <HStack h={"80vh"}>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            h={"100%"}
            w={"100%"}
          >
            <VStack align="stretch" px={2} py={2}>
              <HStack>
                <NextLink href="/admin/paslon/tambah" passHref>
                  <Link
                    borderRadius="md"
                    bg="blue.500"
                    color="white"
                    px={4}
                    pt={2}
                    h={10}
                    w={"30%"}
                    style={{ textDecoration: "none", textAlign: "center" }}
                  >
                    Tambah Paslon Baru
                  </Link>
                </NextLink>
              </HStack>
              <HStack>
                <TableContainer w="100%" h="100%">
                  <Table variant="simple">
                    <TableCaption>
                      Jumlah orang yang bersuara ada 0 orang
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Nama Ketua</Th>
                        <Th>Nama Wakil</Th>
                        <Th>Yang Memilih</Th>
                        <Th>Gambar</Th>
                        <Th>Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* <Tr>
                        <Td>inches</Td>
                        <Td>millimetres (mm)</Td>
                        <Td isNumeric>25.4</Td>
                      </Tr>
                      <Tr>
                        <Td>feet</Td>
                        <Td>centimetres (cm)</Td>
                        <Td isNumeric>30.48</Td>
                      </Tr>
                      <Tr>
                        <Td>yards</Td>
                        <Td>metres (m)</Td>
                        <Td isNumeric>0.91444</Td>
                      </Tr> */}
                      <Tr>
                        <Td colSpan={5} style={{ textAlign: "center" }}>
                          Tidak ada data paslon, Silahkan tambah paslon baru
                          dengan tombol di atas.
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </HStack>
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default Paslon;
