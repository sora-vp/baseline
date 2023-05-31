import {
  useToast,
  AspectRatio,
  Box,
  Stack,
  Heading,
  Text,
  Input,
  type InputProps,
} from "@chakra-ui/react";
import { useEffect, useRef, type InputHTMLAttributes } from "react";

export type IIBType = {
  imgFromInput: string | null;
  count: number;
  onImageDropped: (image: FileList) => void;
} & InputHTMLAttributes<HTMLInputElement> &
  InputProps;

export default function InputImageBox({
  onImageDropped,
  imgFromInput,
  onChange,
  count,
  ...props
}: IIBType) {
  const toast = useToast();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const drop = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const extensions = ["image/jpg", "image/jpeg", "image/png"];
    const instance: HTMLDivElement = drop.current;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { files } = e.dataTransfer as { files: FileList };

      if (count < files.length) {
        toast({
          description: `File gambar yang bisa diterima hanya berjumlah ${count} gambar`,
          status: "error",
          duration: 2500,
          isClosable: true,
        });

        return;
      }

      if (
        Array.from(files).some(
          (file: File) => !extensions.some((format) => file.type === format)
        )
      ) {
        toast({
          description:
            "File harus berupa gambar yang bertipekan jpg, jpeg, png!",
          status: "error",
          duration: 2500,
          isClosable: true,
        });

        return;
      }

      if (files && files.length) {
        onImageDropped(files);
      }
    };

    instance.addEventListener("drop", handleDrop);

    return () => {
      instance.removeEventListener("drop", handleDrop);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AspectRatio ratio={1} ref={drop}>
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
                // eslint-disable-next-line @next/next/no-img-element
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
            onChange={onChange}
            {...props}
          />
        </Box>
      </Box>
    </AspectRatio>
  );
}
