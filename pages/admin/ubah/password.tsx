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
import Head from "next/head";
import NextLink from "next/link";
import Router from "next/router";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

type FormValues = {
  lama: string;
  baru: string;
  konfirmasi: string;
};

const UbahPassword = ({ csrfToken }: commonComponentInterface) => {
  const toast = useToast();

  const validationSchema = Yup.object().shape({
    lama: Yup.string().required("Dibutuhkan password yang lama!"),
    baru: Yup.string()
      .required("Dibutuhkan password baru!")
      .min(6, "Kata sandi setidaknya memiliki panjang 6 karakter!"),
    konfirmasi: Yup.string()
      .required("Dibutuhkan konfirmasi password baru!")
      .oneOf(
        [Yup.ref("baru")],
        "Konfirmasi kata sandi tidak sama dengan kata sandi baru!"
      ),
  });

  const { handleSubmit, register, formState, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const response = await fetch("/api/user", {
      method: "PUT",
      body: JSON.stringify({
        type: "UPDATE_PASSWORD",
        body: {
          lama: data.lama,
          baru: data.baru,
        },
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

    if (result.error) reset();
    else Router.push("/admin");
  };

  return (
    <>
      <Head>
        <title>Ubah Password</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Password
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
                  isInvalid={formState.errors?.lama as unknown as boolean}
                >
                  <FormLabel htmlFor="lama">Password lama</FormLabel>
                  <Input
                    type="password"
                    placeholder="Masukan password yang lama"
                    {...register("lama")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.lama?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  mt={3}
                  isInvalid={formState.errors?.baru as unknown as boolean}
                >
                  <FormLabel htmlFor="baru">Password baru</FormLabel>

                  <Input
                    type="password"
                    placeholder="Masukan password yang baru"
                    {...register("baru")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.baru?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={formState.errors?.konfirmasi as unknown as boolean}
                  mt={3}
                >
                  <FormLabel htmlFor="konfirmasi">
                    Konfirmasi password baru
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Konfirmasi password yang baru"
                    {...register("konfirmasi")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.konfirmasi?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  width="full"
                  mt={4}
                  bg="red.600"
                  color="white"
                  _hover={{
                    bg: "red.800",
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

export default Sidebar(UbahPassword);
