import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Router from "next/router";
import * as Yup from "yup";
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
} from "@chakra-ui/react";
import Alert from "@/component/Alert";
import { useUser } from "@/lib/hooks";
import { commonSSRCallback } from "@/lib/csrf";

import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import type { AlertStatus } from "@chakra-ui/react";

type FormValues = {
  email: string;
  password: string;
};

const Login: NextPage<commonComponentInterface> = ({ csrfToken }) => {
  const toast = useToast();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Diperlukan Email!")
      .email("Email tidak valid!"),
    password: Yup.string().required("Diperlukan Kata Sandi!"),
  });

  const [user, { mutate }] = useUser();
  const [alertShow, setAlertShow] = useState<AlertState>({
    show: false,
    typeStatus: "",
    title: "",
    description: "",
  });
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const body = {
      email: data.email,
      password: data.password,
    };

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CSRF-Token": csrfToken },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      const userObj = await res.json();

      if (userObj?.user) {
        mutate(userObj);

        toast.closeAll();
        toast({
          description: "Berhasil login",
          status: "success",
          duration: 4500,
          position: "top-right",
          isClosable: false,
        });
      }
    } else {
      const response: AlertErrorResponse | ApiErrorInterface = await res.json();

      if ((response as AlertErrorResponse)?.alert) {
        setAlertShow((prevState) => ({
          ...prevState,
          show: true,
          ...(response as AlertErrorResponse)?.error,
        }));
      } else if ((response as ApiErrorInterface)?.error) {
        toast({
          description: (response as ApiErrorInterface)?.message,
          status: "error",
          duration: 4500,
          position: "top-right",
          isClosable: false,
        });
      }
    }
  };

  useEffect(() => {
    Router.prefetch("/admin");
  }, []);

  useEffect(() => {
    if (user) Router.push("/admin");
  }, [user]);

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Head>
        <title>Login sebagai Admin</title>
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
          {alertShow.show && (
            <Alert
              title={alertShow.title}
              description={alertShow.description}
              status={alertShow.typeStatus as AlertStatus}
            />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl
              isInvalid={formState.errors?.email as unknown as boolean}
            >
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="text"
                placeholder="Masukan email"
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
              <Link href="/admin/register">Daftar</Link>
            </span>
          </Text>
        </Box>
      </Box>
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
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Login;
