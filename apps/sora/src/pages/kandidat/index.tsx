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
import { Types } from "mongoose";
import NextLink from "next/link";
import { DateTime } from "luxon";

import { trpc } from "@utils/trpc";
import Sidebar from "@components/Sidebar";

const Candidate = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null!);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const candidateQuery = trpc.candidate.adminCandidateList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const candidateDeleteMutation = trpc.candidate.adminDeleteCandidate.useMutation({
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
  const [currentID, setID] = useState<Types.ObjectId | null>(null);

  const getNama = () => {
    const currentCandidate = candidateQuery.data?.find(
      (p) => p._id === currentID
    );

    return currentCandidate?.namaKandidat;
  };


  return (
    <>
      <Head>
        <title>Daftar Kandidat</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Kandidat
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
                  href="/kandidat/tambah"
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
                    Tambah Kandidat Baru
                  </Button>
                </NextLink>
              </HStack>
              <HStack>
                <TableContainer w="100%" h="100%">
                  <Table variant="simple">
                    {!candidateQuery.isLoading && !candidateQuery.isError && (
                      <TableCaption>
                        {candidateQuery.data.length > 0 ? (
                          <>
                            Jumlah orang yang sudah bersuara berjumlah{" "}
                            {candidateQuery.data
                              .map((p) => p.dipilih)
                              .reduce((curr, acc) => curr + acc, 0)}{" "}
                            orang
                          </>
                        ) : (
                          <>
                            Tidak ada kandidat yang tersedia, silahkan tambahkan
                            kandidat terlebih dahulu.
                          </>
                        )}
                      </TableCaption>
                    )}

                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Nama Kandidat</Th>
                        <Th>Yang Memilih</Th>
                        <Th>Gambar</Th>
                        <Th>Aksi</Th>
                      </Tr>

                    </Thead>
                    <Tbody>
                      {candidateQuery.isLoading && (
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

                      {!candidateQuery.isLoading &&
                        !candidateQuery.isError &&
                        candidateQuery.data &&
                        candidateQuery.data.map((p, idx) => (
                          <Tr key={p._id as unknown as string}>
                            <Td>{++idx}</Td>
                            <Td>{p.namaKandidat}</Td>
                            <Td>{p.dipilih} Orang</Td>
                            <Td>
                              <img
                                src={`/api/uploads/${p.imgName}`}
                                alt={`Gambar dari kandidat ${p.namaKandidat}.`}
                              />
                            </Td>
                            <Td>
                              <NextLink
                                href={`/admin/kandidat/edit/${p._id}`}
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

                      {!candidateQuery.isLoading && !candidateQuery.data && (
                        <Tr>
                          <Td colSpan={5} style={{ textAlign: "center" }}>
                            Tidak ada data kandidat, Silahkan tambah kandidat baru
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
          if (!candidateDeleteMutation.isLoading) {
            setID(null);
            onClose();
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {!candidateDeleteMutation.isLoading && <AlertDialogCloseButton />}
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Kandidat
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin? Jika sudah terhapus maka kandidat {getNama()}{" "}
              <b>TIDAK BISA DIPILIH, DIREVISI, DAN DIKEMBALIKAN LAGI!</b>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={candidateDeleteMutation.isLoading}
              >
                Batal
              </Button>
              <Button
                bg="red.500"
                _hover={{ bg: "red.700" }}
                color="white"
                disabled={candidateDeleteMutation.isLoading}
                onClick={async () => {
                  if (
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canVote?: boolean })
                      ?.canVote
                  )
                    candidateDeleteMutation.mutate({
                      id: currentID as unknown as string,
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

export default Sidebar(Candidate);
