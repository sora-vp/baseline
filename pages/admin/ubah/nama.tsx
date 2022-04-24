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
import * as Yup from "yup";
import Head from "next/head";
import Router from "next/router";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import { useUser } from "@/lib/hooks";

import Sidebar from "@/component/Sidebar";

type FormValues = {
  nama: string;
};

const validNameRegex = /^[a-zA-Z\s\-]+$/;

const UbahNama = ({ csrfToken }: commonComponentInterface) => {
  const toast = useToast();
  const [user, { mutate }] = useUser();

  const validationSchema = Yup.object().shape({
    nama: Yup.string()
      .required("Diperlukan Nama Ketua!")
      .matches(
        validNameRegex,
        "Nama hanya berisikan huruf alphabet yang valid!"
      )
      .test(
        "isNewName",
        "Nama yang ingin diubah tidak boleh sama seperti nama lama!",
        (value) => value !== user?.username
      ),
  });

  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nama: user?.username,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const response = await fetch("/api/user", {
      method: "PUT",
      body: JSON.stringify({
        type: "UPDATE_USERNAME",
        body: data,
      }),
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
    });

    const result = await response.json();

    toast({
      description: result.message,
      status: result.error ? "error" : "success",
      duration: 6000,
      position: "top-right",
      isClosable: true,
    });

    if (!result.error) {
      mutate({
        user: {
          ...(user as unknown as {
            email: string;
            username: string;
            date: Date;
          }),
          username: data.nama,
        },
      });
      Router.push("/admin");
    }
  };

  return (
    <>
      <Head>
        <title>Ubah Nama</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Nama
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
                  <FormLabel htmlFor="nama">Nama Lengkap</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Lengkap"
                    {...register("nama")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.nama?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  bg="green.600"
                  color="white"
                  _hover={{
                    bg: "green.800",
                  }}
                  isLoading={formState.isSubmitting}
                  type="submit"
                >
                  Ubah
                </Button>
                <NextLink href="/admin" passHref>
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

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Sidebar(UbahNama);
