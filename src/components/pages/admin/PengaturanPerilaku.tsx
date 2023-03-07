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
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PengaturanPerilakuValidationSchema as validationSchema,
  type PengaturanPerilakuFormValues as FormValues,
} from "../../../schema/admin.settings.schema";
import { trpc } from "../../../utils/trpc";

const PengaturanPerilaku = () => {
  const toast = useToast();

  const { handleSubmit, control, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    onSuccess(data) {
      reset({
        canVote: data.canVote !== null && data.canVote !== false,
        reloadAfterVote:
          data.reloadAfterVote !== null && data.reloadAfterVote !== false,
      });
    },
  });
  const changeBehaviour = trpc.settings.changeVotingBehaviour.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
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
                  isDisabled={
                    changeBehaviour.isLoading || settingsQuery.isLoading
                  }
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