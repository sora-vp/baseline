import {
  Box,
  Button,
  Container,
  FormControl,
  // Form
  FormErrorMessage,
  FormLabel,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import DatePicker from "../../DatePicker";

const diniHari = DateTime.fromISO(
  DateTime.now().toFormat("yyyy-MM-dd"),
).toJSDate();
const toUTC = (time: Date) => DateTime.fromJSDate(time).toUTC().toJSDate();

const validationSchema = z
  .object({
    startTime: z
      .date({ required_error: "Diperlukan kapan waktu mulai pemilihan!" })
      .min(diniHari, {
        message: "Minimal waktu pemilihan adalah hari ini dini hari!",
      }),
    endTime: z.date({
      required_error: "Diperlukan kapan waktu selesai pemilihan!",
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    path: ["endTime"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

type FormValues = z.infer<typeof validationSchema>;

const PengaturanWaktu = () => {
  const toast = useToast();

  const { handleSubmit, getValues, control, reset, formState } =
    useForm<FormValues>({
      resolver: zodResolver(validationSchema),
    });

  const settingsQuery = api.settings.getSettings.useQuery(undefined, {
    onSuccess(result) {
      if (result.startTime && result.endTime)
        reset({
          startTime: DateTime.fromJSDate(result.startTime)
            .toLocal()
            .toJSDate(),
          endTime: DateTime.fromJSDate(result.endTime)
            .toLocal()
            .toJSDate(),
        });
    },
  });
  const changeTime = api.settings.changeVotingTime.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

      settingsQuery.refetch()
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
    changeTime.mutate({
      startTime: toUTC(data.startTime),
      endTime: toUTC(data.endTime),
    });

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderRadius="lg"
      minHeight="21.5em"
    >
      <Container mx={7} my={7}>
        <Text fontWeight={500} fontSize={"30px"} mb={5}>
          Waktu Pemilihan
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            isInvalid={formState.errors?.startTime as unknown as boolean}
          >
            <FormLabel htmlFor="mulai">Waktu Mulai</FormLabel>
            <Controller
              name={"startTime"}
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Tetapkan waktu mulai"
                  onChange={(date) => field.onChange(date)}
                  selectedDate={field.value as Date | null}
                  filterDate={(day) => day >= diniHari}
                  disabled={changeTime.isLoading || settingsQuery.isLoading}
                  customStyles={{ width: "85%" }}
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.startTime?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            mt={5}
            isInvalid={formState.errors?.endTime as unknown as boolean}
          >
            <FormLabel htmlFor="selesai">Waktu Selesai</FormLabel>
            <Controller
              name={"endTime"}
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Tetapkan waktu selesai"
                  onChange={(date) => field.onChange(date)}
                  selectedDate={field.value as Date | null}
                  filterDate={(day) => day >= diniHari}
                  disabled={changeTime.isLoading || settingsQuery.isLoading}
                  filterTime={(time) => {
                    const selectedDate = new Date(time);
                    const startTime = getValues("startTime");

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
              {formState.errors?.endTime?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            mt={4}
            bg="green.600"
            color="white"
            _hover={{
              bg: "green.800",
            }}
            isLoading={changeTime.isLoading || settingsQuery.isLoading}
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
