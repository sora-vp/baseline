import {
  useToast,
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Link,
  Text,

  // Form
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse as parseCSV } from "csv-parse";
import { useForm } from "react-hook-form";
import Router from "next/router";
import NextLink from "next/link";
import Head from "next/head";

import Sidebar from "@components/Sidebar";

import { trpc } from "@utils/trpc";

import {
  TambahPesertaManyValidationSchema as CSVDataValidator,
  UploadPartisipanValidationSchema as validationSchema,
  type TUploadFormValues as FormValues,
} from "@schema/admin.participant.schema";

const HalamanTambah = () => {
  const toast = useToast();

  const insertManyMutation = trpc.participant.insertManyParticipant.useMutation(
    {
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
    }
  );
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    onSuccess(result) {
      if (result.canAttend) Router.push("/peserta");
    },
  });

  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const file = data.csv.item(0);
    const text = await file!.text(); // Already checked

    parseCSV(text, { columns: true, trim: true }, (err, records) => {
      if (err) toast();

      const result = CSVDataValidator.safeParse(records);

      if (!result.success) return toast();

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
                    isDisabled={
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canAttend ||
                      insertManyMutation.isLoading
                    }
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
                  isDisabled={
                    settingsQuery.isLoading || settingsQuery.data?.canAttend
                  }
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
    </>
  );
};

export default Sidebar(HalamanTambah);
