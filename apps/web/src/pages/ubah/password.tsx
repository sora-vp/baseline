import Head from "next/head";
import NextLink from "next/link";
import Router from "next/router";
import {
  Box,
  Button,
  FormControl,
  // Form
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Link,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ClientChangePasswordSchemaValidator as validationSchema,
  type ClientChangePasswordType as FormValues,
} from "@sora/schema-config/auth.schema";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const UbahPassword = () => {
  const toast = useToast();

  const { handleSubmit, register, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const passwordMutation = api.auth.changePassword.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

      Router.push("/");
    },

    onError(result) {
      reset();

      toast({
        description: result.message,
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: FormValues) =>
    passwordMutation.mutate({ lama: data.lama, baru: data.baru });

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
                    isDisabled={passwordMutation.isLoading}
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
                    isDisabled={passwordMutation.isLoading}
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
                    isDisabled={passwordMutation.isLoading}
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
                  isLoading={passwordMutation.isLoading}
                  type="submit"
                >
                  Ubah
                </Button>
                <NextLink href="/" legacyBehavior passHref>
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

export default Sidebar(UbahPassword);
