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
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Router from "next/router";
import NextLink from "next/link";
import { DateTime } from "luxon";
import Head from "next/head";
import * as Yup from "yup";

import InputImageBox from "@/component/InputImageBox";
import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

type FormValues = {
  ketua: string;
  wakil: string;
  image: File;
};

const validNameRegex = /^[a-zA-Z\s\-]+$/;

const HalamanTambah = ({ csrfToken }: commonComponentInterface) => {
  const toast = useToast();
  const [imgFromInput, setIFI] = useState<string | null>(null);

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

  const { handleSubmit, register, formState, control, reset, watch } =
    useForm<FormValues>({
      resolver: yupResolver(validationSchema),
    });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "image" && type === "change") {
        const image = (value.image as unknown as { [0]: File })[0];

        if (image) {
          const objectUrl = URL.createObjectURL(image);
          setIFI(objectUrl);
        } else {
          if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);

          setIFI(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();

      if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);

      setIFI(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const onSubmit = async (data: FormValues) => {
    let formData = new FormData();
    const keys = Object.keys(data);

    formData.append("timeZone", DateTime.local().zoneName);

    for (const key of keys) {
      if (key === "image")
        formData.append(key, (data[key] as unknown as { [0]: File })[0]);
      else formData.append(key, data[key as keyof FormValues]);
    }

    const response = await fetch("/api/admin/paslon", {
      method: "POST",
      body: formData,
      headers: {
        "CSRF-Token": csrfToken,
      },
    });

    const result = await response.json();

    toast({
      description: result.message,
      status: result.error ? "error" : "success",
      duration: 6000,
      position: "top-right",
      isClosable: true,
    });

    if (result.error) {
      reset();

      if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);
      setIFI(null);
    } else Router.push("/admin/paslon");
  };

  return (
    <>
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
                    isDisabled={formState.isSubmitting}
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
                    isDisabled={formState.isSubmitting}
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
                  <Controller
                    name={"image"}
                    control={control}
                    render={({ field }) => (
                      <InputImageBox
                        imgFromInput={imgFromInput}
                        isDisabled={formState.isSubmitting}
                        count={1}
                        onChange={(e) =>
                          field.onChange(
                            (e.target as unknown as { files: File }).files
                          )
                        }
                        onImageDropped={(img) => field.onChange(img)}
                      />
                    )}
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
    </>
  );
};

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Sidebar(HalamanTambah);