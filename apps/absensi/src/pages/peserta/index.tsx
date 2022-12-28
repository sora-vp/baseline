import { useMemo, useRef, useState } from "react";
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
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,

  // Alert dialog
  // AlertDialog,
  // AlertDialogBody,
  // AlertDialogFooter,
  // AlertDialogHeader,
  // AlertDialogContent,
  // AlertDialogOverlay,
  // AlertDialogCloseButton,

  //
  Flex,
  Tooltip,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  Select,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";

import { trpc, type allParticipantOutput } from "@utils/trpc";
import Sidebar from "@components/Sidebar";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<allParticipantOutput[number]>();

const columns = [
  columnHelper.accessor((row) => row.nama, {
    id: "Nama",
  }),
  columnHelper.accessor((row) => row.keterangan, {
    id: "Keterangan",
  }),
  columnHelper.accessor((row) => row.qrId, {
    id: "QR ID",
  }),
];

const Paslon = () => {
  // const toast = useToast();
  // const cancelRef = useRef<HTMLButtonElement>(null!);

  // const { isOpen, onOpen, onClose } = useDisclosure();

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const participantQuery = trpc.participant.getParticipantPaginated.useQuery(
    {
      pageIndex,
      pageSize,
    },
    {
      keepPreviousData: true,
      refetchInterval: 2500,
      refetchIntervalInBackground: true,
    }
  );
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  // const paslonDeleteMutation = trpc.paslon.adminDeleteCandidate.useMutation({
  //   onSuccess(result) {
  //     onClose();

  //     toast({
  //       description: result.message,
  //       status: "success",
  //       duration: 6000,
  //       position: "top-right",
  //       isClosable: true,
  //     });
  //   },

  //   onError(result) {
  //     toast({
  //       description: result.message,
  //       status: "error",
  //       duration: 6000,
  //       position: "top-right",
  //       isClosable: true,
  //     });
  //   },
  // });

  const table = useReactTable({
    data: participantQuery.data?.data ?? [],
    columns,
    pageCount: participantQuery.data?.paging.pages ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  });

  // Untuk keperluan hapus data
  // const [currentID, setID] = useState<string | null>(null);

  // const getNama = () => {
  //   const currentPaslon = participantQuery.data?.find((p) => p._id === currentID);

  //   return `${currentPaslon?.namaKetua} dan ${currentPaslon?.namaWakil}`;
  // };

  return (
    <>
      <Head>
        <title>Peserta Pemilih</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Peserta Pemilih
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
                  href="/peserta/tambah"
                  passHref={
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canAttend?: boolean })
                      ?.canAttend
                  }
                >
                  <Button
                    isDisabled={
                      settingsQuery.isLoading || settingsQuery.data?.canAttend
                    }
                    borderRadius="md"
                    bg="blue.500"
                    color="white"
                  >
                    Tambah Peserta Baru
                  </Button>
                </NextLink>
              </HStack>
              <HStack>
                <TableContainer w="100%" h="100%">
                  <Table variant="simple">
                    {!participantQuery.isLoading &&
                      !participantQuery.isError && (
                        <TableCaption>
                          {participantQuery.data.data.length > 0 ? (
                            <></>
                          ) : (
                            <></>
                          )}
                        </TableCaption>
                      )}

                    <Thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <Th key={header.id}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </Th>
                          ))}
                        </Tr>
                      ))}
                    </Thead>
                    <Tbody>
                      {participantQuery.isLoading && (
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

                      {table.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <Td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </Td>
                          ))}
                        </Tr>
                      ))}

                      {/* {!participantQuery.isLoading &&
                        !participantQuery.isError &&
                        participantQuery.data &&
                        participantQuery.data.map((p) => (
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
                                href={`/paslon/edit/${p._id}`}
                                passHref={
                                  !settingsQuery.isLoading ||
                                  !(
                                    settingsQuery.data as unknown as {
                                      canAttend?: boolean;
                                    }
                                  )?.canAttend
                                }
                              >
                                <Button
                                  isDisabled={
                                    settingsQuery.isLoading ||
                                    settingsQuery.data?.canAttend
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
                                  settingsQuery.data?.canAttend
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
                                        canAttend?: boolean;
                                      }
                                    )?.canAttend
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
                        ))} */}

                      {(!participantQuery.isLoading &&
                        !participantQuery.data) ||
                        (participantQuery.data &&
                          participantQuery.data.data.length < 1 && (
                            <Tr>
                              <Td colSpan={5} style={{ textAlign: "center" }}>
                                Tidak ada data peserta, Silahkan tambah peserta
                                baru dengan tombol di atas.
                              </Td>
                            </Tr>
                          ))}
                    </Tbody>
                    <Tfoot></Tfoot>
                  </Table>

                  {participantQuery.data &&
                    participantQuery.data.data.length > 0 && (
                      <Flex
                        justifyContent="space-between"
                        marginTop={5}
                        alignItems="center"
                      >
                        <Flex>
                          <Tooltip label="Halaman Pertama">
                            <IconButton
                              onClick={() => table.setPageIndex(0)}
                              isDisabled={!table.getCanPreviousPage()}
                              // icon={<ArrowLeftIcon h={3} w={3} />}
                              mr={4}
                            />
                          </Tooltip>
                          <Tooltip label="Halaman Sebelumnya">
                            <IconButton
                              onClick={table.previousPage}
                              isDisabled={!table.getCanPreviousPage()}
                              // icon={<ChevronLeftIcon h={6} w={6} />}
                            />
                          </Tooltip>
                        </Flex>

                        <Flex alignItems="center">
                          <Text flexShrink="0" mr={8}>
                            Page{" "}
                            <Text fontWeight="bold" as="span">
                              {pageIndex + 1}
                            </Text>{" "}
                            of{" "}
                            <Text fontWeight="bold" as="span">
                              {table.getPageOptions.length + 1}
                            </Text>
                          </Text>
                          <Text flexShrink="0">Ke halaman:</Text>{" "}
                          <NumberInput
                            ml={2}
                            mr={8}
                            w={28}
                            min={1}
                            max={table.getPageOptions.length + 1}
                            onChange={(value) => {
                              const page = value ? Number(value) - 1 : 0;
                              table.setPageIndex(page);
                            }}
                            defaultValue={pageIndex + 1}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <Select
                            w={32}
                            value={pageSize}
                            onChange={(e) =>
                              table.setPageSize(Number(e.target.value))
                            }
                          >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                              <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                              </option>
                            ))}
                          </Select>
                        </Flex>

                        <Flex>
                          <Tooltip label="Halaman Selanjutnya">
                            <IconButton
                              onClick={table.nextPage}
                              isDisabled={!table.getCanNextPage()}
                              // icon={<ChevronRightIcon h={6} w={6} />}
                            />
                          </Tooltip>
                          <Tooltip label="Halaman Terakhir">
                            <IconButton
                              onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                              }
                              isDisabled={!table.getCanNextPage()}
                              // icon={<ArrowRightIcon h={3} w={3} />}
                              ml={4}
                            />
                          </Tooltip>
                        </Flex>
                      </Flex>
                    )}
                </TableContainer>
              </HStack>
            </VStack>
          </Box>
        </HStack>
      </VStack>

      {/* <AlertDialog
        isCentered
        isOpen={
          !(settingsQuery.isLoading || settingsQuery.data?.canAttend) && isOpen
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
                    !(settingsQuery.data as unknown as { canAttend?: boolean })
                      ?.canAttend
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
      </AlertDialog> */}
    </>
  );
};

export default Sidebar(Paslon);
