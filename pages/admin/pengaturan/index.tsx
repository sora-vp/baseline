import {
  useColorModeValue,
  Container,
  VStack,
  HStack,
  Text,
  Box,
  Button,

  // Form
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import * as Yup from "yup";
import Head from "next/head";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

import DatePicker from "@/component/DatePicker";

const Pengaturan = () => {
  return (
    <>
      <Head>
        <title>Pengaturan</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Pengaturan
          </Text>
        </HStack>
        <HStack>
          <PengaturanWaktu />
        </HStack>
      </VStack>
    </>
  );
};

const diniHari = DateTime.fromISO(
  DateTime.now().toFormat("yyyy-MM-dd")
).toJSDate();

type PengaturanWaktuFormValues = {
  mulai: Date;
  selesai: Date;
};
const PengaturanWaktu = () => {
  const validationSchema = Yup.object().shape({
    mulai: Yup.date()
      .required("Diperlukan kapan waktu mulai pemilihan!")
      .min(diniHari, "Minimal waktu pemilihan adalah hari ini dini hari!"),
    selesai: Yup.date()
      .required("Diperlukan kapan waktu selesai pemilihan!")
      .min(
        Yup.ref("mulai"),
        "Waktu selesai tidak boleh kurang dari waktu mulai!"
      ),
  });

  const { handleSubmit, getValues, control, formState } =
    useForm<PengaturanWaktuFormValues>({
      resolver: yupResolver(validationSchema),
    });

  const onSubmit = (data: PengaturanWaktuFormValues) => {
    console.log(data);
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderRadius="lg"
    >
      <Container mx={7} my={7}>
        <Text fontWeight={500} fontSize={"30px"} mb={5}>
          Waktu Pemilihan
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            isInvalid={formState.errors?.mulai as unknown as boolean}
          >
            <FormLabel htmlFor="mulai">Waktu Mulai</FormLabel>
            <Controller
              name={"mulai"}
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Tetapkan waktu mulai"
                  onChange={(date) => field.onChange(date)}
                  selectedDate={field.value as Date | null}
                  filterDate={(day) => day >= diniHari}
                  customStyles={{ width: "85%" }}
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.mulai?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            mt={4}
            isInvalid={formState.errors?.selesai as unknown as boolean}
          >
            <FormLabel htmlFor="selesai">Waktu Selesai</FormLabel>
            <Controller
              name={"selesai"}
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Tetapkan waktu selesai"
                  onChange={(date) => field.onChange(date)}
                  selectedDate={field.value as Date | null}
                  filterDate={(day) => day >= diniHari}
                  filterTime={(time) => {
                    const selectedDate = new Date(time);
                    const startTime = getValues("mulai");

                    if (!startTime) return false;
                    return selectedDate.getTime() > startTime.getTime();
                  }}
                  showTimeSelect
                  dateFormat="MM/dd/yyyy h:mm aa"
                  customStyles={{ width: "85%" }}
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.selesai?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            mt={4}
            bg="green.600"
            color="white"
            _hover={{
              bg: "green.800",
            }}
            isLoading={formState.isSubmitting}
            type="submit"
          >
            Simpan
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Sidebar(Pengaturan);
