import { useRef, useState } from "react";
import {
  useToast,
  useColorModeValue,
  useDisclosure,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Spinner,

  // Table
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,

  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";
import { Types } from "mongoose";

import { usePaslon, useSettings } from "@/lib/hooks";

import { getBaseUrl } from "@/lib/utils";
import { ssrCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

import type { IPaslon } from "@/models/Paslon";
import type { TModelApiResponse } from "@/lib/settings";

type PaslonType = commonComponentInterface & {
  paslon: IPaslon[];
  settingsFallback: TModelApiResponse | null;
};

const Paslon = ({
  csrfToken,
  paslon: paslonFallback,
  settingsFallback,
}: PaslonType) => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null!);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paslon, { loading, mutate }] = usePaslon({
    fallbackData: paslonFallback,
  });
  const [settings] = useSettings({
    fallbackData: settingsFallback,
  });

  // Untuk keperluan hapus data
  const [currentID, setID] = useState<Types.ObjectId | null>(null);
  const [isSubmitting, setSubmit] = useState<boolean>(false);

  const getNama = () => {
    const currentPaslon = paslon && paslon!.find((p) => p._id === currentID);

    return `${currentPaslon?.ketua} dan ${currentPaslon?.wakil}`;
  };

  return (
    <>
      <Head>
        <title>Daftar Paslon</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Paslon
          </Text>
        </HStack>
        <HStack>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            h={"100%"}
            w={"100%"}
            style={{ minHeight: "80vh" }}
          >
            <VStack align="stretch" px={2} py={2}>
              <HStack>
                <NextLink href="/admin/paslon/tambah" passHref>
                  <Button
                    isDisabled={settings?.canVote as unknown as boolean}
                    borderRadius="md"
                    bg="blue.500"
                    color="white"
                    as={"a"}
                  >
                    Tambah Paslon Baru
                  </Button>
                </NextLink>
              </HStack>
              <HStack>
                <TableContainer w="100%" h="100%">
                  <Table variant="simple">
                    {!loading && paslon && (
                      <TableCaption>
                        Jumlah orang yang sudah bersuara berjumlah{" "}
                        {paslon
                          .map((p) => p.memilih)
                          .reduce((curr, acc) => curr + acc, 0)}{" "}
                        orang
                      </TableCaption>
                    )}
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
                      {loading && (
                        <Tr>
                          <Td colSpan={5} style={{ textAlign: "center" }}>
                            <Spinner
                              size="xl"
                              speed="0.95s"
                              emptyColor="gray.200"
                              color="blue.500"
                            />
                          </Td>
                        </Tr>
                      )}
                      {paslon ? (
                        <>
                          {paslon.map((p) => (
                            <Tr key={p.imgName}>
                              <Td>{p.ketua}</Td>
                              <Td>{p.wakil}</Td>
                              <Td>{p.memilih} Orang</Td>
                              <Td>
                                <img
                                  src={`/api/uploads/${p.imgName}`}
                                  alt={`Gambar dari pasangan calon ${p.ketua} dan ${p.wakil}.`}
                                />
                              </Td>
                              <Td>
                                <Button
                                  isDisabled={
                                    settings?.canVote as unknown as boolean
                                  }
                                  bg="orange.500"
                                  _hover={{ bg: "orange.700" }}
                                  color="white"
                                >
                                  Edit
                                </Button>
                                <Button
                                  isDisabled={
                                    settings?.canVote as unknown as boolean
                                  }
                                  bg="red.500"
                                  _hover={{ bg: "red.700" }}
                                  ml={2}
                                  color="white"
                                  onClick={() => {
                                    setID(p._id);
                                    onOpen();
                                  }}
                                >
                                  Hapus
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </>
                      ) : (
                        !loading && (
                          <Tr>
                            <Td colSpan={5} style={{ textAlign: "center" }}>
                              Tidak ada data paslon, Silahkan tambah paslon baru
                              dengan tombol di atas.
                            </Td>
                          </Tr>
                        )
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </HStack>
            </VStack>
          </Box>
        </HStack>
      </VStack>
      <AlertDialog
        isCentered
        isOpen={(!(settings?.canVote as unknown) as boolean) && isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!isSubmitting) {
            setID(null);
            onClose();
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {!isSubmitting && <AlertDialogCloseButton />}
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Paslon
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin? Jika sudah terhapus maka paslon {getNama()}{" "}
              <b>TIDAK BISA DIPILIH, DIREVISI, DAN DIKEMBALIKAN LAGI!</b>.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                bg="red.500"
                _hover={{ bg: "red.700" }}
                color="white"
                disabled={isSubmitting}
                onClick={async () => {
                  setSubmit(true);

                  let formData = new FormData();
                  formData.append("id", currentID as unknown as string);

                  const response = await fetch("/api/admin/paslon", {
                    method: "DELETE",
                    body: formData,
                    headers: {
                      "CSRF-Token": csrfToken,
                    },
                  });

                  const result = await response.json();

                  setSubmit(false);
                  onClose();

                  if (!result.error)
                    mutate({
                      paslon: paslon!.filter((p) => p._id !== currentID),
                    });

                  toast({
                    description: result.message,
                    status: result.error ? "error" : "success",
                    duration: 6000,
                    position: "top-right",
                    isClosable: true,
                  });
                }}
                ml={3}
              >
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PaslonType> = async ({
  req,
  res,
}) => {
  const baseUrl = getBaseUrl(req);
  await ssrCallback({ req, res });

  const [{ paslon }, pengaturan] = await Promise.all([
    fetch(`${baseUrl}/api/vote`).then((res) => res.json()),
    fetch(`${baseUrl}/api/settings`).then((res) => res.json()),
  ]);

  return {
    props: {
      settingsFallback: pengaturan ? pengaturan : null,
      paslon: paslon ? paslon : null,
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export default Sidebar(Paslon);
