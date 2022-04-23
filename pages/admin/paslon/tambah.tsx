import {
  useToast,
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
  image: File;
};

const validNameRegex = /^[a-zA-Z\s\-]+$/;

const HalamanTambah: NextPage = () => {
  const toast = useToast();

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
    image: Yup.mixed()
      .test(
        "required",
        "Diperlukan file gambar paslon",
        (value) => value && value.length
      )
      .test(
        "fileSize",
        "Ukuran gambar maksimal adalah 2MB!",
        (value) => value && value[0] && value[0].size <= 200000
      )
      .test(
        "type",
        "File harus berupa gambar yang bertipekan jpg, jpeg, png!",
        (value) => {
          const extensions = ["jpg", "jpeg", "png"];
          const type = value[0]?.type;

          return (
            value &&
            value[0] &&
            type.includes("image/") &&
            extensions.some((ext) => ext === type.split("image/")[1])
          );
        }
      ),
  });

  const [user] = useUser();
  const { handleSubmit, register, formState, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  const onSubmit = async (data: FormValues) => {
    let formData = new FormData();
    const keys = Object.keys(data);

    for (const key of keys) {
      if (key === "image")
        formData.append(key, (data[key] as unknown as { [0]: File })[0]);
      else formData.append(key, data[key as keyof FormValues]);
    }

    const response = await fetch("/api/admin/paslon", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    toast({
      description: result.message,
      status: result.error ? "error" : "success",
      duration: 6000,
      position: "top-right",
      isClosable: true,
    });

    if (result.error) reset();
    else Router.push("/admin/paslon");
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
            w={{
              base: "75%",
              md: "50%",
            }}
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
                <FormControl
                  mt={6}
                  isInvalid={formState.errors?.image as unknown as boolean}
                >
                  <FormLabel htmlFor="image">Gambar Paslon</FormLabel>
                  <Input
                    type="file"
                    placeholder="Masukan gambar kedua paslon"
                    {...register("image")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.image?.message}
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
