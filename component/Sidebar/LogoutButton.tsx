import { useRef, useEffect } from "react";
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

import { useUser } from "@/lib/hooks";

type LogoutButtonType = {
  setClientRectCB(rect: DOMRect): void;
};

const LogoutButton = ({
  setClientRectCB,
  csrfToken,
}: LogoutButtonType & commonComponentInterface) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cancelRef = useRef<HTMLButtonElement>(null!);
  const buttonElement = useRef<HTMLButtonElement>(null!);

  const [, { mutate }] = useUser();

  useEffect(() => {
    const setSize = () => {
      setClientRectCB(buttonElement.current.getBoundingClientRect());
    };
    setSize();

    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
    };
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
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  fetch(`/api/user`, {
                    method: "DELETE",
                    headers: {
                      "CSRF-Token": csrfToken,
                    },
                  })
                    .then((res) => res.json())
                    .then((result) => {
                      toast.closeAll();
                      toast({
                        description: result.message,
                        status: result.error ? "error" : "success",
                        duration: 4500,
                        position: "top-right",
                        isClosable: false,
                      });

                      if (!result.error) {
                        mutate({ user: null });
                        Router.replace("/admin/login");
                      }
                    });
                }}
                ml={3}
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
