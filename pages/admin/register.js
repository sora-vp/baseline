import Alert from "../../components/AlertSet";
import { getBaseUrl } from "../../utils/url";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
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
import axios from "axios";

export default function Register() {
  const [alertShow, setAlertShow] = useState({
    show: false,
    typeStatus: "",
    title: "",
    description: "",
  });
  const { handleSubmit, errors, register, formState, getValues } = useForm();

  const onSubmit = (val) => {
    const baseUrl = getBaseUrl();

    return axios.post(`${baseUrl}/auth/register`, val).then((response) => {
      const { data } = response;

      switch (data.type) {
        case "SUCCESS":
          return setAlertShow((prevState) => ({
            ...prevState,
            show: true,
            typeStatus: "success",
            title: data.message,
            description: "Silahkan login.",
          }));
        case "USER_EXIST":
          return setAlertShow((prevState) => ({
            ...prevState,
            show: true,
            typeStatus: "warning",
            title: data.message,
            description: "Buat akun dengan email yang berbeda.",
          }));
        case "SERVER_ERROR":
          console.log("Error registrasi akun, data : ", data.message);
          break;
        default:
          return;
      }
    });
  };

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
              status={alertShow.typeStatus}
            />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="Masukan email"
                ref={register({
                  required: "Bidang ini wajib diisi !",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Masukan email yang valid !",
                  },
                })}
              />
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl mt={6} isInvalid={errors.nama}>
              <FormLabel htmlFor="pass">Nama Lengkap</FormLabel>
              <Input
                type="input"
                name="nama"
                placeholder="Masukan nama lengkap"
                ref={register({
                  required: "Bidang ini wajib diisi !",
                  pattern: {
                    value: /^[a-zA-Z\s\-]+$/,
                    message: "Nama harus berupa huruf kecil atau kapital !",
                  },
                })}
              />
              <FormErrorMessage>
                {errors.nama && errors.nama.message}
              </FormErrorMessage>
            </FormControl>
            <HStack mt={6}>
              <FormControl isInvalid={errors.pass}>
                <FormLabel htmlFor="pass">Kata Sandi</FormLabel>
                <Input
                  type="password"
                  name="pass"
                  placeholder="Masukan kata sandi"
                  ref={register({
                    required: "Bidang ini wajib diisi !",
                    minLength: 5,
                  })}
                />
                <FormErrorMessage>
                  {errors.pass && errors.pass.message}
                  {errors.pass?.type === "minLength" &&
                    "Kata sandi minimal memiliki panjang 5 digit !"}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.passConfirm}>
                <FormLabel htmlFor="passConfirm">
                  Konfirmasi kata Sandi
                </FormLabel>
                <Input
                  type="password"
                  name="passConfirm"
                  placeholder="Masukan kata sandi"
                  ref={register({
                    required: "Bidang ini wajib diisi !",
                    validate: (value) => value === getValues("pass"),
                  })}
                />
                <FormErrorMessage>
                  {errors.passConfirm && errors.passConfirm.message}
                  {errors.passConfirm?.type === "validate" &&
                    "Kata sandi tidak sama !"}
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
}
