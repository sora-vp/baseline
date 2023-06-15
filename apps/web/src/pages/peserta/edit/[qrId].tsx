import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
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
  TambahPesertaValidationSchema as validationSchema,
  type TambahFormValues as FormValues,
} from "@sora/schema-config/admin.participant.schema";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const EditPesertaWithID = () => {
  const toast = useToast();
  const router = useRouter();

  const { handleSubmit, register, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const specificParticipantQuery =
    api.participant.getSpecificParticipant.useQuery(
      router.query.qrId as string,
      {
        refetchOnWindowFocus: false,
        onSuccess: reset,
        onError(result) {
          toast({
            description: result.message,
            status: "error",
            duration: 6000,
            position: "top-right",
            isClosable: true,
          });
        },
      },
    );

  const participantMutation = api.participant.updateParticipant.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

      router.push("/peserta");
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

  const onSubmit = (data: FormValues) =>
    participantMutation.mutate({
      name: data.name,
      subpart: data.subpart,
      qrId: router.query.qrId as string,
    });

  return (
    <>
      <Head>
        <title>Ubah Peserta</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Informasi Peserta
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
                  <FormLabel htmlFor="name">Nama Peserta</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Peserta"
                    isDisabled={
                      specificParticipantQuery.isLoading ||
                      participantMutation.isLoading
                    }
                    {...register("name")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.name?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={formState.errors?.subpart as unknown as boolean}
                >
                  <FormLabel htmlFor="subpart">Peserta Bagian Dari</FormLabel>
                  <Input
                    mt={4}
                    type="text"
                    placeholder="Masukan Peserta Bagian Dari"
                    isDisabled={
                      specificParticipantQuery.isLoading ||
                      participantMutation.isLoading
                    }
                    {...register("subpart")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.subpart?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  width="full"
                  mt={4}
                  colorScheme="cyan"
                  backgroundColor="cyan.500"
                  color="cyan.50"
                  _hover={{ color: "white" }}
                  isDisabled={specificParticipantQuery.isLoading}
                  isLoading={participantMutation.isLoading}
                  type="submit"
                >
                  Ubah
                </Button>
                <NextLink href="/peserta" legacyBehavior passHref>
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

export default Sidebar(EditPesertaWithID);
