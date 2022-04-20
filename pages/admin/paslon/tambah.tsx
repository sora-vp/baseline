import {
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Link,
  Text,

  // Form
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import Router from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import * as Yup from "yup";

import type { NextPage } from "next";

import { useUser } from "@/lib/hooks";
import Sidebar from "@/component/Sidebar/index";

type FormValues = {
  ketua: string;
  wakil: string;
};

const validNameRegex = /^[a-zA-Z\s\-]+$/;

const HalamanTambah: NextPage = () => {
  const validationSchema = Yup.object().shape({
    ketua: Yup.string()
      .required("Diperlukan Nama Ketua!")
      .matches(
        validNameRegex,
        "Nama hanya berisikan huruf alphabet yang valid!"
      ),
    wakil: Yup.string()
      .required("Diperlukan Nama Wakil Ketua!")
      .matches(
        validNameRegex,
        "Nama hanya berisikan huruf alphabet yang valid!"
      ),
  });

  const [user] = useUser();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <Sidebar>
      <Head>
        <title>Tambah Paslon</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Tambah Paslon Baru
          </Text>
        </HStack>
        <HStack justifyContent="center">
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            w={"50%"}
          >
            <Box my={4} mx={4} textAlign="left">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl
                  isInvalid={formState.errors?.ketua as unknown as boolean}
                >
                  <FormLabel htmlFor="ketua">Nama Ketua</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Ketua"
                    {...register("ketua")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.ketua?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl
                  mt={6}
                  isInvalid={formState.errors?.wakil as unknown as boolean}
                >
                  <FormLabel htmlFor="wakil">Nama Wakil Ketua</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Wakil Ketua"
                    {...register("wakil")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.wakil?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  colorScheme="blue"
                  backgroundColor="blue.500"
                  color="blue.50"
                  _hover={{ color: "white" }}
                  isLoading={formState.isSubmitting}
                  type="submit"
                >
                  Tambah
                </Button>
                <NextLink href="/admin/paslon" passHref>
                  <Link display={"flex"} justifyContent="center" mt={2} mb={3}>
                    Kembali
                  </Link>
                </NextLink>
              </form>
            </Box>
          </Box>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default HalamanTambah;
