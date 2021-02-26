import { useForm } from "react-hook-form";
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

export default function Login() {
  const { handleSubmit, errors, register, formState } = useForm();

  const onSubmit = (val) => {
    console.log(val);
  };

  return (
    <Flex width="full" height="100vh" align="center" justifyContent="center">
      <Box
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
                {errors.multipleErrorInput?.type === "minLength" &&
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
        </Box>
      </Box>
    </Flex>
  );
}
