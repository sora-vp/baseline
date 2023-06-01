import {
  Box,
  Button,
  Container,
  FormControl,
  // Form
  FormErrorMessage,
  FormLabel,
  Switch,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  PengaturanPerilakuValidationSchema as validationSchema,
  type PengaturanPerilakuFormValues as FormValues,
} from "@sora/schema-config/admin.settings.schema";

import { api } from "~/utils/api";

const PengaturanPerilaku = () => {
  const toast = useToast();

  const { handleSubmit, control, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const settingsQuery = api.settings.getSettings.useQuery(undefined, {
    onSuccess(data) {
      reset({
        canVote: data.canVote,
        canAttend: data.canAttend,
      });
    },
  });
  const changeBehaviour = api.settings.changeVotingBehaviour.useMutation({
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

  const onSubmit = (data: FormValues) => changeBehaviour.mutate(data);

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderRadius="lg"
      minHeight="21.5em"
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
                  colorScheme="red"
                  size="lg"
                  isChecked={field.value}
                  onChange={(checked) => field.onChange(checked)}
                  isDisabled={
                    changeBehaviour.isLoading || settingsQuery.isLoading
                  }
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.canVote?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            mt={6}
            isInvalid={formState.errors?.canAttend as unknown as boolean}
          >
            <FormLabel htmlFor="mulai">Sudah Bisa Absen</FormLabel>
            <Controller
              name={"canAttend"}
              control={control}
              render={({ field }) => (
                <Switch
                  colorScheme="cyan"
                  size="lg"
                  isChecked={field.value}
                  onChange={(checked) => field.onChange(checked)}
                  isDisabled={
                    changeBehaviour.isLoading || settingsQuery.isLoading
                  }
                />
              )}
            />
            <FormErrorMessage>
              {formState.errors?.canAttend?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            mt={6}
            bg="green.600"
            color="white"
            _hover={{
              bg: "green.800",
            }}
            isLoading={changeBehaviour.isLoading || settingsQuery.isLoading}
            type="submit"
          >
            Simpan
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default PengaturanPerilaku;
