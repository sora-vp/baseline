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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Router from "next/router";
import NextLink from "next/link";
import { DateTime } from "luxon";
import Head from "next/head";

import InputImageBox from "../../../components/InputImageBox";
import Sidebar from "../../../components/Sidebar";

import { trpc } from "../../../utils/trpc";

import {
  TambahKandidatValidationSchema as validationSchema,
  type TambahFormValues as FormValues,
} from "../../../schema/admin.candidate.schema";

const HalamanTambah = () => {
  const toast = useToast();
  const [imgFromInput, setIFI] = useState<string | null>(null);

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    onSuccess(result) {
      if (result.canVote) Router.push("/admin/kandidat");
    },
  });

  const { handleSubmit, register, formState, control, reset, watch } =
    useForm<FormValues>({
      resolver: zodResolver(validationSchema),
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
    const formData = new FormData();
    const keys = Object.keys(data);

    formData.append("timeZone", DateTime.local().zoneName);

    for (const key of keys) {
      if (key === "image")
        formData.append(key, (data[key] as unknown as { [0]: File })[0]);
      else formData.append(key, data[key as keyof FormValues]);
    }

    const response = await fetch("/api/admin/kandidat", {
      method: "POST",
      body: formData,
      headers: {
        credentials: "include",
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
    } else Router.push("/admin/kandidat");
  };

  return (
    <>
      <Head>
        <title>Tambah Kandidat</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Tambah Kandidat Baru
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
                  isInvalid={formState.errors?.kandidat as unknown as boolean}
                >
                  <FormLabel htmlFor="ketua">Nama Kandidat</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Kandidat"
                    isDisabled={
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canVote ||
                      formState.isSubmitting
                    }
                    {...register("kandidat")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.kandidat?.message}
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
                        isDisabled={
                          settingsQuery.isLoading ||
                          settingsQuery.data?.canVote ||
                          formState.isSubmitting
                        }
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
                  isDisabled={
                    settingsQuery.isLoading || settingsQuery.data?.canVote
                  }
                  type="submit"
                >
                  Tambah
                </Button>
                <NextLink href="/admin/kandidat" legacyBehavior passHref>
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

export default Sidebar(HalamanTambah);
