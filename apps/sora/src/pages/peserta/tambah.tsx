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
import { useForm } from "react-hook-form";
import Router from "next/router";
import NextLink from "next/link";
import Head from "next/head";

import Sidebar from "@components/Sidebar";

import { trpc } from "@utils/trpc";

import {
  TambahPesertaValidationSchema as validationSchema,
  type TambahFormValues as FormValues,
} from "@schema/admin.participant.schema";

const HalamanTambah = () => {
  const toast = useToast();

  const participantMutation = trpc.participant.createNewParticipant.useMutation(
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

  const onSubmit = (data: FormValues) => participantMutation.mutate(data);

  return (
    <>
      <Head>
        <title>Tambah Peserta</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Tambah Peserta Baru
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
                  isInvalid={formState.errors?.nama as unknown as boolean}
                >
                  <FormLabel htmlFor="nama">Nama Peserta</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Peserta"
                    isDisabled={
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canAttend ||
                      participantMutation.isLoading
                    }
                    {...register("nama")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.nama?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  mt={6}
                  isInvalid={formState.errors?.status as unknown as boolean}
                >
                  <FormLabel htmlFor="status">Status Peserta</FormLabel>
                  <Input
                    type="text"
                    isDisabled={
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canAttend ||
                      participantMutation.isLoading
                    }
                    placeholder="Masukan Status Peserta"
                    {...register("status")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.status?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  width="full"
                  mt={4}
                  colorScheme="blue"
                  backgroundColor="blue.500"
                  color="blue.50"
                  _hover={{ color: "white" }}
                  isLoading={participantMutation.isLoading}
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
