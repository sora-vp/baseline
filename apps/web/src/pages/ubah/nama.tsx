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
  ChangeNameSchemaValidator as validationSchema,
  type ChangeNameType as FormValues,
} from "@sora/schema-config/auth.schema";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const UbahNama = () => {
  const toast = useToast();

  const { handleSubmit, register, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const userInfo = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess(result) {
      reset({ name: result.name });
    },
  });

  const nameMutatation = api.auth.changeName.useMutation({
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
      toast({
        description: result.message,
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (data.name === userInfo.data?.name)
      return toast({
        description:
          "Nama yang ingin di ubah tidak boleh sama dengan nama yang sebelumnya!",
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

    nameMutatation.mutate(data);
  };

  return (
    <>
      <Head>
        <title>Ubah Nama</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Nama
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
                  isInvalid={formState.errors?.name as unknown as boolean}
                >
                  <FormLabel htmlFor="nama">Nama Lengkap</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Lengkap"
                    isDisabled={nameMutatation.isLoading || userInfo.isLoading}
                    {...register("name")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.name?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  bg="green.600"
                  color="white"
                  _hover={{
                    bg: "green.800",
                  }}
                  isLoading={nameMutatation.isLoading}
                  isDisabled={userInfo.isLoading}
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

export default Sidebar(UbahNama);
