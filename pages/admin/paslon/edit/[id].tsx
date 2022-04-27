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

  // Image Form
  AspectRatio,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { Types } from "mongoose";
import { DateTime } from "luxon";
import NextLink from "next/link";
import Router from "next/router";
import Head from "next/head";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { usePaslon, useSettings } from "@/lib/hooks";

import { getBaseUrl } from "@/lib/utils";
import { ssrCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

import type { IPaslon } from "@/models/Paslon";
import type { TModelApiResponse } from "@/lib/settings";

type PaslonType = commonComponentInterface & {
  paslon: IPaslon[];
  settingsFallback: TModelApiResponse | null;
  paslonID: Types.ObjectId;
};
type FormValues = {
  ketua: string;
  wakil: string;
  image: File;
};

const validNameRegex = /^[a-zA-Z\s\-]+$/;

const EditPaslonWithID = ({
  paslon: paslonFallback,
  settingsFallback,
  paslonID,
  csrfToken,
}: PaslonType) => {
  const toast = useToast();
  const [imgFromInput, setIFI] = useState<string | null>(null);

  const [paslon, { mutate }] = usePaslon({ fallbackData: paslonFallback });
  const [settings] = useSettings({ fallbackData: settingsFallback });

  const currentPaslon = useMemo(
    () => paslon?.find((peserta) => peserta._id === paslonID),
    [paslon, paslonID]
  );

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
      .test("fileSize", "Ukuran gambar maksimal adalah 2MB!", (value) => {
        // Gakpapa kalo gambarnya kosong
        if (value && value.length < 1) return true;
        else
          return (
            value && value.length > 0 && value[0] && value[0].size <= 200000
          );
      })
      .test(
        "type",
        "File harus berupa gambar yang bertipekan jpg, jpeg, png!",
        (value) => {
          const extensions = ["jpg", "jpeg", "png"];
          const type = value[0]?.type;

          if (value && value.length < 1) return true;
          else
            return (
              value &&
              value.length > 0 &&
              value[0] &&
              type.includes("image/") &&
              extensions.some((ext) => ext === type.split("image/")[1])
            );
        }
      ),
  });

  const { handleSubmit, register, formState, reset, watch } =
    useForm<FormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        ketua: currentPaslon?.ketua,
        wakil: currentPaslon?.wakil,
      },
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

  useEffect(() => {
    if (settings.canVote) Router.push("/admin/paslon");
  }, [settings]);

  const onSubmit = async (data: FormValues) => {
    let formData = new FormData();
    const keys = Object.keys(data);

    formData.append("timeZone", DateTime.local().zoneName);
    formData.append("id", currentPaslon?._id as unknown as string);

    for (const key of keys) {
      if (key === "image")
        formData.append(
          key,
          (data[key] as unknown as { [0]: File })[0] &&
            (data[key] as unknown as { [0]: File })[0]
        );
      else formData.append(key, data[key as keyof FormValues]);
    }

    const response = await fetch("/api/admin/paslon", {
      method: "PUT",
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
    } else {
      mutate({
        paslon:
          paslon?.map((peserta: IPaslon) =>
            peserta?._id === currentPaslon?._id
              ? {
                  ...peserta,
                  ketua: data.ketua,
                  wakil: data.wakil,
                }
              : peserta
          ) || null,
      });
      Router.push("/admin/paslon");
    }
  };

  return (
    <>
      <Head>
        <title>Ubah Paslon</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Paslon
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
                  <AspectRatio ratio={1}>
                    <Box
                      borderColor="gray.300"
                      borderStyle="dashed"
                      borderWidth="2px"
                      rounded="md"
                      shadow="sm"
                      role="group"
                      transition="all 150ms ease-in-out"
                      _hover={{
                        shadow: "md",
                      }}
                    >
                      <Box position="relative" height="85%" width="100%">
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          height="100%"
                          width="100%"
                          display="flex"
                          flexDirection="column"
                        >
                          <Stack
                            height="100%"
                            width="100%"
                            display="flex"
                            alignItems="center"
                            justify="center"
                            spacing="4"
                          >
                            {imgFromInput !== null ? (
                              <img
                                src={imgFromInput}
                                alt={"Gambar input dari administrator."}
                              />
                            ) : (
                              <Stack p="8" textAlign="center" spacing="1">
                                <Heading fontSize="lg" fontWeight="bold">
                                  Seret gambar kesini
                                </Heading>
                                <Text fontWeight="light">
                                  atau klik disini untuk mengunggah
                                </Text>
                              </Stack>
                            )}
                          </Stack>
                        </Box>
                        <Input
                          type="file"
                          height="100%"
                          width="100%"
                          position="absolute"
                          top="0"
                          left="0"
                          opacity="0"
                          aria-hidden="true"
                          accept="image/*"
                          {...register("image")}
                        />
                      </Box>
                    </Box>
                  </AspectRatio>
                  <FormErrorMessage>
                    {formState.errors?.image?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  bg="orange.500"
                  _hover={{ bg: "orange.700" }}
                  color="white"
                  isLoading={formState.isSubmitting}
                  type="submit"
                >
                  Edit
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

export const getServerSideProps: GetServerSideProps<PaslonType> = async ({
  req,
  res,
  params,
}) => {
  const { id } = params as unknown as { id: Types.ObjectId };

  const baseUrl = getBaseUrl(req);
  await ssrCallback({ req, res });

  const [{ paslon }, pengaturan] = await Promise.all([
    fetch(`${baseUrl}/api/vote`).then((res) => res.json()),
    fetch(`${baseUrl}/api/settings`).then((res) => res.json()),
  ]);

  if (
    pengaturan.canVote ||
    !paslon ||
    !Types.ObjectId.isValid(id) ||
    !paslon.find((peserta: IPaslon) => peserta._id === id)
  ) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/paslon",
      },
    };
  }

  return {
    props: {
      paslonID: id as Types.ObjectId,
      settingsFallback: pengaturan ? pengaturan : null,
      paslon: paslon ? paslon : null,
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export default Sidebar(EditPaslonWithID);
