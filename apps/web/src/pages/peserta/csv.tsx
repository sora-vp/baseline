import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import Router from "next/router";
import {
  Box,
  Button,
  FormControl,
  // Form
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Link,
  ListItem,
  // Modal
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  //List
  UnorderedList,
  VStack,
  // Hook
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse as parseCSV } from "csv-parse";
import { useForm } from "react-hook-form";

import {
  TambahPesertaManyValidationSchema as CSVDataValidator,
  UploadPartisipanValidationSchema as validationSchema,
  type TUploadFormValues as FormValues,
} from "@sora/schema-config/admin.participant.schema";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

type StateZodErr = { error: Array<{ message: string; path: Array<number | string> }>; dataOfError: Array<{ "Bagian Dari": string; Nama: string }> };

const HalamanTambah = () => {
  const toast = useToast();
  const [errors, setErr] = useState<StateZodErr | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const insertManyMutation = api.participant.insertManyParticipant.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

      Router.push("/peserta");
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

  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const file = data.csv.item(0) as File;
    const text = await file.text(); // Already checked

    parseCSV(text, { columns: true, trim: true }, (err, records) => {
      if (err)
        toast({
          description: err.message,
          status: "error",
          duration: 6000,
          position: "top-right",
          isClosable: true,
        });

      const result = CSVDataValidator.safeParse(records);

      if (!result.success) {
        const error = JSON.parse(result.error.message) as StateZodErr['error'];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const dataOfError = error.map(d => records[d.path[0]])

        setErr({ error, dataOfError: dataOfError as StateZodErr['dataOfError'] });

        return onOpen();
      }

      console.log(result.data)

      insertManyMutation.mutate(result.data);
    });
  };

  return (
    <>
      <Head>
        <title>Tambah Peserta via Upload</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Upload File CSV
          </Text>
        </HStack>
        <HStack justifyContent="center">
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            w={{
              base: "75%",
              md: "50%",
            }}
          >
            <Box my={4} mx={4} textAlign="left">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl
                  isInvalid={formState.errors?.csv as unknown as boolean}
                >
                  <FormLabel htmlFor="csv">File CSV</FormLabel>
                  <Input
                    type="file"
                    accept="text/csv"
                    placeholder="Masukan File CSV"
                    isDisabled={insertManyMutation.isLoading}
                    {...register("csv")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.csv?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  width="full"
                  mt={4}
                  colorScheme="blue"
                  backgroundColor="blue.500"
                  color="blue.50"
                  _hover={{ color: "white" }}
                  isLoading={insertManyMutation.isLoading}
                  type="submit"
                >
                  Tambah
                </Button>
                <NextLink href="/peserta" legacyBehavior passHref>
                  <Link display={"flex"} justifyContent="center" mt={2} mb={3}>
                    Kembali
                  </Link>
                </NextLink>
              </form>
            </Box>
          </Box>
        </HStack>
      </VStack>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setErr(null);
        }}
      >
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent>
          <ModalHeader>Gagal Upload Peserta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Gagal mengunggah data peserta pemilihan dikarenakan format yang
              tidak sesuai dengan yang diharapkan.
            </Text>

            <Text mt="5" mb="5">
              Berikut ini daftar yang tidak sesuai:
            </Text>

            <UnorderedList>
              {errors?.error.map((error, idx) => (
                <ListItem key={idx}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/** @ts-ignore */}
                  Kolom {error.path[1]} data {JSON.stringify(errors.dataOfError[idx][error.path[1]])}
                  . {error.message}
                </ListItem>
              ))}
            </UnorderedList>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Sidebar(HalamanTambah);
