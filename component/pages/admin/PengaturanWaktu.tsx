import {
  useToast,
  useColorModeValue,
  Container,
  Box,
  Button,
  Text,

  // Form
  FormErrorMessage,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import * as Yup from "yup";

import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import type { useSettingsType } from "@/lib/hooks";

import DatePicker from "@/component/DatePicker";

const diniHari = DateTime.fromISO(
  DateTime.now().toFormat("yyyy-MM-dd")
).toJSDate();
const toUTC = (time: Date) => DateTime.fromJSDate(time).toUTC();

type FormValues = {
  mulai: Date;
  selesai: Date;
};
const PengaturanWaktu = ({
  settingsObject,
  csrfToken,
}: {
  settingsObject: useSettingsType;
} & commonComponentInterface) => {
  const toast = useToast();
  const [settings, { mutate }] = settingsObject;

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

  const { handleSubmit, getValues, control, formState } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues:
      settings?.startTime && settings?.endTime
        ? {
            mulai: DateTime.fromISO(settings?.startTime as unknown as string)
              .toLocal()
              .toJSDate(),
            selesai: DateTime.fromISO(settings?.endTime as unknown as string)
              .toLocal()
              .toJSDate(),
          }
        : {},
  });

  const onSubmit = async (data: FormValues) => {
    const sendedBody = {
      mulai: toUTC(data.mulai),
      selesai: toUTC(data.selesai),
    };

    const response = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        type: "UPDATE_TIME",
        body: sendedBody,
      }),
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json",
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

    if (!result.error)
      mutate({
        ...settings,
        startTime: sendedBody.mulai.toJSDate(),
        endTime: sendedBody.selesai.toJSDate(),
      });
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
                  disabled={formState.isSubmitting}
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
                  disabled={formState.isSubmitting}
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

export default PengaturanWaktu;
