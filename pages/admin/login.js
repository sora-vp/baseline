import Alert from "../../components/AlertSet";
import { getBaseUrl } from "../../utils/url";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
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
  Heading,
} from "@chakra-ui/react";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [alertShow, setAlertShow] = useState({
    show: false,
    typeStatus: "",
    title: "",
    description: "",
  });
  const {
    handleSubmit,
    errors,
    register,
    formState,
    reset,
    setValue,
  } = useForm();

  const onSubmit = (val) => {
    const baseUrl = getBaseUrl();

    return axios.post(`${baseUrl}/auth/login`, val).then((response) => {
      const { data } = response;

      switch (data.type) {
        case "SUCCESS":
          console.log("BERHASIL, data : ", data);
          router.push("/admin");
          break;
        case "PASS_WRONG":
          setValue("pass", "");
          return setAlertShow((prevState) => ({
            ...prevState,
            show: true,
            typeStatus: "warning",
            title: data.message,
            description: "",
          }));
        case "USER_NOT_FOUND":
          reset();
          return setAlertShow((prevState) => ({
            ...prevState,
            show: true,
            typeStatus: "danger",
            title: data.message,
            description: "",
          }));
        default:
          return;
      }
    });
  };

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Head>
        <title>Login sebagai Admin</title>
      </Head>
      <Box
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        backgroundColor="#fff"
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
            <FormControl mt={6} isInvalid={errors.pass}>
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
          fill="#276749"
          fillOpacity="1"
          d="M0,32L34.3,69.3C68.6,107,137,181,206,176C274.3,171,343,85,411,64C480,43,549,85,617,117.3C685.7,149,754,171,823,181.3C891.4,192,960,192,1029,176C1097.1,160,1166,128,1234,144C1302.9,160,1371,224,1406,256L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
        ></path>
      </svg>
    </Flex>
  );
}
