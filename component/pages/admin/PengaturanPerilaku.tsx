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
  Switch,
} from "@chakra-ui/react";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import type { useSettingsType } from "@/lib/hooks";

type FormValues = {
  canVote: boolean;
  reloadAfterVote: boolean;
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
    canVote: Yup.boolean().required(
      "Diperlukan konfigurasi apakah sudah bisa memilih!"
    ),
    reloadAfterVote: Yup.boolean().required(
      "Diperlukan konfigurasi refresh setelah memilih!"
    ),
  });

  const { handleSubmit, control, formState } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      canVote: settings?.canVote !== null && settings?.canVote !== false,
      reloadAfterVote:
        settings?.reloadAfterVote !== null &&
        settings?.reloadAfterVote !== false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const response = await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        type: "UPDATE_BEHAVIOUR",
        body: data,
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
        ...data,
      });
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderRadius="lg"
    >
      <Container mx={7} my={7}>
        <Text fontWeight={500} fontSize={"30px"} mb={6}>
          Perilaku Pemilihan
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            isInvalid={formState.errors?.canVote as unknown as boolean}
          >
            <FormLabel htmlFor="mulai">Sudah Bisa Memilih</FormLabel>
            <Controller
              name={"canVote"}
              control={control}
              render={({ field }) => (
                <Switch
                  colorScheme="cyan"
                  size="lg"
                  isChecked={field.value}
                  onChange={(checked) => field.onChange(checked)}
                  isDisabled={formState.isSubmitting}
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.canVote?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            mt={6}
            isInvalid={formState.errors?.reloadAfterVote as unknown as boolean}
          >
            <FormLabel htmlFor="selesai">
              Refresh halaman setelah memilih
            </FormLabel>
            <Controller
              name={"reloadAfterVote"}
              control={control}
              render={({ field }) => (
                <Switch
                  colorScheme="yellow"
                  size="lg"
                  isChecked={field.value}
                  onChange={(checked) => field.onChange(checked)}
                  isDisabled={formState.isSubmitting}
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.reloadAfterVote?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            mt={7}
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
