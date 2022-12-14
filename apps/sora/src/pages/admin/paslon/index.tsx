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
import { DateTime } from "luxon";

import { trpc } from "../../../utils/trpc";
import Sidebar from "../../../components/Sidebar";

const Paslon = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null!);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const paslonQuery = trpc.paslon.adminCandidateList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const paslonDeleteMutation = trpc.paslon.adminDeleteCandidate.useMutation({
    onSuccess(result) {
      onClose();

      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
    },

    onError(result) {
      toast({
        description: result.message,
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  // Untuk keperluan hapus data
  const [currentID, setID] = useState<string | null>(null);

  const getNama = () => {
    const currentPaslon = paslonQuery.data?.find((p) => p._id === currentID);

    return `${currentPaslon?.namaKetua} dan ${currentPaslon?.namaWakil}`;
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
                <NextLink
                  href="/admin/paslon/tambah"
                  passHref={
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canVote?: boolean })
                      ?.canVote
                  }
                >
                  <Button
                    isDisabled={
                      settingsQuery.isLoading || settingsQuery.data?.canVote
                    }
                    borderRadius="md"
                    bg="blue.500"
                    color="white"
                  >
                    Tambah Paslon Baru
                  </Button>
                </NextLink>
              </HStack>
              <HStack>
                <TableContainer w="100%" h="100%">
                  <Table variant="simple">
                    {!paslonQuery.isLoading && !paslonQuery.isError && (
                      <TableCaption>
                        {paslonQuery.data.length > 0 ? (
                          <>
                            Jumlah orang yang sudah bersuara berjumlah{" "}
                            {paslonQuery.data
                              .map((p) => p.dipilih)
                              .reduce((curr, acc) => curr + acc, 0)}{" "}
                            orang
                          </>
                        ) : (
                          <>
                            Tidak ada paslon yang tersedia, silahkan tambahkan
                            paslon terlebih dahulu.
                          </>
                        )}
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
                      {paslonQuery.isLoading && (
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

                      {!paslonQuery.isLoading &&
                        !paslonQuery.isError &&
                        paslonQuery.data &&
                        paslonQuery.data.map((p) => (
                          <Tr key={p._id}>
                            <Td>{p.namaKetua}</Td>
                            <Td>{p.namaWakil}</Td>
                            <Td>{p.dipilih} Orang</Td>
                            <Td>
                              <img
                                src={`/api/uploads/${p.imgName}`}
                                alt={`Gambar dari pasangan calon ${p.namaKetua} dan ${p.namaWakil}.`}
                              />
                            </Td>
                            <Td>
                              <NextLink
                                href={`/admin/paslon/edit/${p._id}`}
                                passHref={
                                  !settingsQuery.isLoading ||
                                  !(
                                    settingsQuery.data as unknown as {
                                      canVote?: boolean;
                                    }
                                  )?.canVote
                                }
                              >
                                <Button
                                  isDisabled={
                                    settingsQuery.isLoading ||
                                    settingsQuery.data?.canVote
                                  }
                                  bg="orange.500"
                                  _hover={{ bg: "orange.700" }}
                                  color="white"
                                >
                                  Edit
                                </Button>
                              </NextLink>
                              <Button
                                isDisabled={
                                  settingsQuery.isLoading ||
                                  settingsQuery.data?.canVote
                                }
                                bg="red.500"
                                _hover={{ bg: "red.700" }}
                                ml={2}
                                color="white"
                                onClick={() => {
                                  if (
                                    !settingsQuery.isLoading ||
                                    !(
                                      settingsQuery.data as unknown as {
                                        canVote?: boolean;
                                      }
                                    )?.canVote
                                  ) {
                                    setID(p._id);
                                    onOpen();
                                  }
                                }}
                              >
                                Hapus
                              </Button>
                            </Td>
                          </Tr>
                        ))}

                      {!paslonQuery.isLoading && !paslonQuery.data && (
                        <Tr>
                          <Td colSpan={5} style={{ textAlign: "center" }}>
                            Tidak ada data paslon, Silahkan tambah paslon baru
                            dengan tombol di atas.
                          </Td>
                        </Tr>
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
        isOpen={
          !(settingsQuery.isLoading || settingsQuery.data?.canVote) && isOpen
        }
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!paslonDeleteMutation.isLoading) {
            setID(null);
            onClose();
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {!paslonDeleteMutation.isLoading && <AlertDialogCloseButton />}
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Paslon
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin? Jika sudah terhapus maka paslon {getNama()}{" "}
              <b>TIDAK BISA DIPILIH, DIREVISI, DAN DIKEMBALIKAN LAGI!</b>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={paslonDeleteMutation.isLoading}
              >
                Batal
              </Button>
              <Button
                bg="red.500"
                _hover={{ bg: "red.700" }}
                color="white"
                disabled={paslonDeleteMutation.isLoading}
                onClick={async () => {
                  if (
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canVote?: boolean })
                      ?.canVote
                  )
                    paslonDeleteMutation.mutate({
                      id: currentID as string,
                      timeZone: DateTime.now().zoneName,
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

export default Sidebar(Paslon);
