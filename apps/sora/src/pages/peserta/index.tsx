import { useMemo, useRef, useState } from "react";
import {
  useToast,
  useColorModeValue,
  // useDisclosure,
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
import { BiFirstPage, BiLastPage } from "react-icons/bi";
import { GrPrevious, GrNext } from "react-icons/gr";

import { trpc, type allParticipantOutput } from "@utils/trpc";
import Sidebar from "@components/Sidebar";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<allParticipantOutput["docs"][number]>();

const columns = [
  columnHelper.accessor((row) => row.nama, {
    id: "Nama",
  }),
  columnHelper.accessor((row) => row.status, {
    id: "Status",
  }),
  columnHelper.accessor((row) => row.qrId, {
    id: "QR ID",
  }),
  columnHelper.accessor("sudahAbsen", {
    cell: (info) => (
      <span style={{ fontSize: "1.4rem" }}>
        {info.getValue() ? "✅" : "❌"}
      </span>
    ),
    header: "Sudah Absen",
  }),

  columnHelper.accessor("sudahMemilih", {
    cell: (info) => (
      <span style={{ fontSize: "1.4rem" }}>
        {info.getValue() ? "✅" : "❌"}
      </span>
    ),
    header: "Sudah Memilih",
  }),
];

const Paslon = () => {
  const toast = useToast();
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
      pageIndex: pageIndex > 0 ? pageIndex * pageSize : 0,
      pageSize,
    },
    {
      onError(result) {
        toast({
          description: result.message,
          status: "error",
          duration: 6000,
          position: "top-right",
        });
      },
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
    }
  );
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    onError(result) {
      toast({
        description: result.message,
        status: "error",
        duration: 6000,
        position: "top-right",
      });
    },
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
    data: participantQuery.data?.docs ?? [],
    columns,
    pageCount: participantQuery.data?.totalPages ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
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

      <style>{`
        .prev-gr polyline,
        .next-gr polyline {
          stroke: ${useColorModeValue("black", "white")};
        }

        .first-page, .last-page {
          width: 1.7em; 
          height: 1.7em;
        }
      `}</style>

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

                      {(!participantQuery.isLoading &&
                        !participantQuery.data) ||
                        (participantQuery.data &&
                          participantQuery.data.docs.length < 1 && (
                            <Tr>
                              <Td colSpan={5} style={{ textAlign: "center" }}>
                                Tidak ada data peserta, Silahkan tambah peserta
                                baru dengan tombol di atas.
                              </Td>
                            </Tr>
                          ))}
                    </Tbody>
                  </Table>

                  {participantQuery.data &&
                    participantQuery.data.docs.length > 0 && (
                      <Flex
                        justifyContent="space-between"
                        marginTop={5}
                        alignItems="center"
                      >
                        <Flex>
                          <Tooltip label="Halaman Pertama">
                            <IconButton
                              aria-label={"Halaman Pertama"}
                              onClick={() => table.setPageIndex(0)}
                              isDisabled={!table.getCanPreviousPage()}
                              icon={<BiFirstPage className="first-page" />}
                              mr={4}
                            />
                          </Tooltip>
                          <Tooltip label="Halaman Sebelumnya">
                            <IconButton
                              aria-label={"Halaman Sebelumnya"}
                              onClick={table.previousPage}
                              isDisabled={!table.getCanPreviousPage()}
                              icon={<GrPrevious className={"prev-gr"} />}
                            />
                          </Tooltip>
                        </Flex>

                        <Flex alignItems="center">
                          <Text flexShrink="0" mr={8}>
                            Halaman{" "}
                            <Text fontWeight="bold" as="span">
                              {pageIndex + 1}
                            </Text>{" "}
                            dari{" "}
                            <Text fontWeight="bold" as="span">
                              {table.getPageCount()}
                            </Text>
                          </Text>
                          <Text flexShrink="0">Ke halaman:</Text>{" "}
                          <NumberInput
                            ml={2}
                            mr={8}
                            w={28}
                            min={1}
                            max={table.getPageCount()}
                            onChange={(value) => {
                              const page = value ? Number(value) - 1 : 0;
                              table.setPageIndex(page);
                            }}
                            value={pageIndex + 1}
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
                              aria-label={"Halaman Selanjutnya"}
                              onClick={table.nextPage}
                              isDisabled={!table.getCanNextPage()}
                              icon={<GrNext className={"next-gr"} />}
                            />
                          </Tooltip>
                          <Tooltip label="Halaman Terakhir">
                            <IconButton
                              aria-label={"Halaman Terakhir"}
                              onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                              }
                              isDisabled={!table.getCanNextPage()}
                              icon={<BiLastPage className="last-page" />}
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
