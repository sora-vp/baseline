/* eslint-disable react-hooks/rules-of-hooks */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import {
  useColorModeValue,
  useToast,
  Flex,
  Box,
  Text,
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Heading,
  Spinner,
} from "@chakra-ui/react";

import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

import {
  ClientRegisterSchemaValidator,
  type ClientRegisterType,
} from "../../schema/auth.schema";

import { trpc } from "../../utils/trpc";

import type { NextPage } from "next";

const RegisterSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    style={{ position: "absolute", bottom: "0%", zIndex: "-1" }}
  >
    <path
      fill="#0987a0"
      fillOpacity="1"
      d="M0,160L48,181.3C96,203,192,245,288,229.3C384,213,480,139,576,106.7C672,75,768,85,864,106.7C960,128,1056,160,1152,192C1248,224,1344,256,1392,272L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
    ></path>
  </svg>
);

const Register: NextPage = () => {
  const [isLoading, setLoading] = useState(true);

  const toast = useToast();
  const router = useRouter();

  const registerUser = trpc.auth.register.useMutation({
    onSuccess(data) {
      if (data.success) {
        toast.closeAll();
        toast({
          description:
            "Berhasil mendaftarkan akun baru! Silahkan login terlebih dahulu.",
          status: "success",
          duration: 4500,
          position: "top-right",
          isClosable: false,
        });

        router.push("/admin/login");
      }
    },
    onError(error) {
      toast({
        description: error.message,
        status: "error",
        duration: 4500,
        position: "top-right",
        isClosable: false,
      });
    },
  });

  const { handleSubmit, register, formState } = useForm<ClientRegisterType>({
    resolver: zodResolver(ClientRegisterSchemaValidator),
  });

  const onSubmit = (val: ClientRegisterType) =>
    registerUser.mutate({
      email: val.email,
      password: val.password,
      nama: val.nama,
    });

  useEffect(() => {
    router.prefetch("/admin");

    getSession().then((session) => {
      if (session) {
        router.replace("/admin");
      } else {
        setLoading(false);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading)
    return (
      <Flex width="full" height="100vh" align="center" justifyContent="center">
        <Head>
          <title>Daftarkan Akun Admin</title>
        </Head>
        <Box
          bg={useColorModeValue("white", "gray.900")}
          p={8}
          maxWidth="550px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          top="50%"
        >
          <Spinner thickness="4px" size="xl" />
        </Box>
        <RegisterSvg />
      </Flex>
    );

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Head>
        <title>Daftarkan Akun Admin</title>
      </Head>
      <Box
        bg={useColorModeValue("white", "gray.900")}
        p={8}
        maxWidth="550px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        top="50%"
      >
        <Box textAlign="center">
          <Heading>Register Administrator</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl
              isInvalid={formState.errors?.email as unknown as boolean}
            >
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                placeholder="Masukan email"
                disabled={registerUser.isLoading}
                {...register("email")}
              />
              <FormErrorMessage>
                {formState.errors?.email?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mt={6}
              isInvalid={formState.errors?.nama as unknown as boolean}
            >
              <FormLabel htmlFor="pass">Nama Lengkap</FormLabel>
              <Input
                type="text"
                placeholder="Masukan nama lengkap"
                disabled={registerUser.isLoading}
                {...register("nama")}
              />
              <FormErrorMessage>
                {formState.errors?.nama?.message}
              </FormErrorMessage>
            </FormControl>
            <HStack mt={6}>
              <FormControl
                isInvalid={formState.errors?.password as unknown as boolean}
              >
                <FormLabel htmlFor="pass">Kata Sandi</FormLabel>
                <Input
                  type="password"
                  placeholder="Masukan kata sandi"
                  disabled={registerUser.isLoading}
                  {...register("password")}
                />
                <FormErrorMessage>
                  {formState.errors?.password?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={formState.errors?.passConfirm as unknown as boolean}
              >
                <FormLabel htmlFor="passConfirm">
                  Konfirmasi kata Sandi
                </FormLabel>
                <Input
                  type="password"
                  placeholder="Masukan kata sandi"
                  disabled={registerUser.isLoading}
                  {...register("passConfirm")}
                />
                <FormErrorMessage>
                  {formState.errors?.passConfirm?.message}
                </FormErrorMessage>
              </FormControl>
            </HStack>
            <Button
              width="full"
              mt={4}
              colorScheme="cyan"
              backgroundColor="cyan.500"
              color="cyan.50"
              _hover={{ color: "white" }}
              isLoading={registerUser.isLoading}
              type="submit"
            >
              Register
            </Button>
          </form>
          <Text align="center" marginTop="10px">
            Sudah punya akun admin ?{" "}
            <span style={{ color: "#3182CE" }}>
              <Link href="/admin/login">Login</Link>
            </span>
          </Text>
        </Box>
      </Box>
      <RegisterSvg />
    </Flex>
  );
};

export default Register;
