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
  Heading,
  Spinner,
} from "@chakra-ui/react";

import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

import { LoginSchemaValidator, type LoginType } from "../schema/auth.schema";

import type { NextPage } from "next";

const LoginSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    style={{ position: "absolute", bottom: "0%", zIndex: "-1" }}
  >
    <path
      fill={useColorModeValue("#276749", "#2F855A")}
      fillOpacity="1"
      d="M0,32L34.3,69.3C68.6,107,137,181,206,176C274.3,171,343,85,411,64C480,43,549,85,617,117.3C685.7,149,754,171,823,181.3C891.4,192,960,192,1029,176C1097.1,160,1166,128,1234,144C1302.9,160,1371,224,1406,256L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
    ></path>
  </svg>
);

const Login: NextPage = () => {
  const [isLoading, setLoading] = useState(true);

  const toast = useToast();
  const router = useRouter();

  const { handleSubmit, register, formState } = useForm<LoginType>({
    resolver: zodResolver(LoginSchemaValidator),
  });

  const onSubmit = async (data: LoginType) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.ok) {
      toast.closeAll();
      toast({
        description: "Berhasil login",
        status: "success",
        duration: 4500,
        position: "top-right",
        isClosable: false,
      });

      if (!router.query?.callbackUrl) return router.replace("/");

      const url = new URL(router.query?.callbackUrl as string);
      router.replace(url.pathname as string);
    } else {
      toast({
        description: result?.error,
        status: "error",
        duration: 4500,
        position: "top-right",
        isClosable: false,
      });
    }
  };

  useEffect(() => {
    router.prefetch("/");

    getSession().then((session) => {
      if (session) {
        router.replace("/");
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
          <title>Login sebagai admin</title>
        </Head>
        <Box
          bg={useColorModeValue("white", "gray.900")}
          p={8}
          maxWidth="500px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          top="50%"
        >
          <Spinner thickness="4px" size="xl" />
        </Box>
        <LoginSvg />
      </Flex>
    );

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Head>
        <title>Login sebagai admin</title>
      </Head>
      <Box
        bg={useColorModeValue("white", "gray.900")}
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        top="50%"
      >
        <Box textAlign="center">
          <Heading>Login Administrator</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl
              isInvalid={formState.errors?.email as unknown as boolean}
            >
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="text"
                placeholder="Masukan email"
                disabled={formState.isSubmitting}
                {...register("email")}
              />
              <FormErrorMessage>
                {formState.errors?.email?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mt={6}
              isInvalid={formState.errors?.password as unknown as boolean}
            >
              <FormLabel htmlFor="pass">Kata Sandi</FormLabel>
              <Input
                type="password"
                placeholder="Masukan kata sandi"
                disabled={formState.isSubmitting}
                {...register("password")}
              />
              <FormErrorMessage>
                {formState.errors?.password?.message}
              </FormErrorMessage>
            </FormControl>
            <Button
              width="full"
              mt={4}
              colorScheme="green"
              backgroundColor="green.500"
              color="green.50"
              _hover={{ color: "white" }}
              isLoading={formState.isSubmitting}
              type="submit"
            >
              Login
            </Button>
          </form>
          <Text align="center" marginTop="10px">
            Belum punya akun admin ?{" "}
            <span style={{ color: "#3182CE" }}>
              <Link href="/register">Daftar</Link>
            </span>
          </Text>
        </Box>
      </Box>
      <LoginSvg />
    </Flex>
  );
};

export default Login;
