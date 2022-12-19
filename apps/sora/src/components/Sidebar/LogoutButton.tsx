import { useState, useRef, useEffect } from "react";
import {
  useDisclosure,
  useToast,
  Flex,
  Icon,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import Router from "next/router";
import { BsDoorOpen } from "react-icons/bs";
import { signOut } from "next-auth/react";

type LogoutButtonType = {
  setClientRectCB(rect: DOMRect): void;
};

const LogoutButton = ({ setClientRectCB }: LogoutButtonType) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [isLoading, setLoading] = useState<boolean>(false);

  const cancelRef = useRef<HTMLButtonElement>(null!);
  const buttonElement = useRef<HTMLButtonElement>(null!);

  useEffect(() => {
    const setSize = () => {
      setClientRectCB(buttonElement.current.getBoundingClientRect());
    };
    setSize();

    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button style={{ width: "100%" }} onClick={onOpen} ref={buttonElement}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: "red.500",
            color: "white",
          }}
        >
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            as={BsDoorOpen}
          />
          Logout
        </Flex>
      </button>

      <AlertDialog
        motionPreset="slideInBottom"
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Konfirmasi Logout
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin untuk Logout? Anda masih bisa login kembali.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
                Batal
              </Button>
              <Button
                isDisabled={isLoading}
                colorScheme="red"
                ml={3}
                onClick={() => {
                  setLoading(true);

                  signOut({
                    redirect: false,
                  })
                    .then(() => {
                      Router.push("/login");

                      toast.closeAll();
                      toast({
                        description: "Berhasil logout!",
                        status: "success",
                        duration: 4500,
                        position: "top-right",
                        isClosable: false,
                      });
                    })
                    .catch(() => {
                      setLoading(false);

                      toast({
                        description:
                          "Terjadi kesalahan saat logout! Coba lagi nanti.",
                        status: "error",
                        duration: 4500,
                        position: "top-right",
                        isClosable: false,
                      });
                    });
                }}
              >
                Iya
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default LogoutButton;
