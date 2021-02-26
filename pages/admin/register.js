import { useForm } from "react-hook-form";
import Head from "next/head";
import {
  Flex,
  Box,
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
} from "@chakra-ui/react";

export default function Register() {
  const { handleSubmit, errors, register, formState } = useForm();

  const onSubmit = (val) => {
    console.log(val);
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
