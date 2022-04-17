import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Router from "next/router";
import * as Yup from "yup";
import {
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
} from "@chakra-ui/react";
import Alert from "@/component/Alert";
import { useUser } from "@/lib/hooks";

import type { NextPage } from "next";
import type { AlertStatus } from "@chakra-ui/react";

type FormValues = {
  email: string;
  nama: string;
  password: string;
  passConfirm: string;
};

const Register: NextPage = () => {
  const validationSchema = Yup.object().shape({
    nama: Yup.string().required("Diperlukan Nama!"),
    email: Yup.string()
      .required("Diperlukan Email!")
      .email("Email tidak valid!"),
    password: Yup.string()
      .required("Password is required")
      .required("Diperlukan Kata Sandi!")
      .min(6, "Kata sandi setidaknya memiliki panjang 6 karakter!"),
    passConfirm: Yup.string()
      .required("Konfirmasi kata sandi diperlukan!")
      .oneOf([Yup.ref("password"), null], "Konfirmasi kata sandi tidak sama!"),
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

  const onSubmit = async (val: FormValues) => {
    const body = {
      email: val.email,
      password: val.password,
      name: val.nama,
    };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 201) {
      const userObj = await res.json();

      if (userObj?.user) mutate(userObj);
    } else {
      const response: AlertErrorResponse = await res.json();

      if (response.alert) {
        setAlertShow((prevState) => ({
          ...prevState,
          show: true,
          ...response.error,
        }));
      }
    }
  };

  useEffect(() => {
    if (user) Router.push("/admin");
  }, [user]);

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Head>
        <title>Daftarkan Akun Admin</title>
      </Head>
      <Box
        p={8}
        maxWidth="550px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        backgroundColor="#fff"
        top="50%"
      >
        <Box textAlign="center">
          <Heading>Register Administrator</Heading>
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
                type="email"
                placeholder="Masukan email"
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
              isLoading={formState.isSubmitting}
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
    </Flex>
  );
};

export default Register;
