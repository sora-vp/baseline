import React from "react";
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

const LogoutButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null!);
  const [, { mutate }] = useUser();
  const toast = useToast();

  return (
    <>
      <button style={{ width: "100%" }} onClick={onOpen}>
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
                  }).then((res) => {
                    if (res.status === 204 || res.status === 401) {
                      mutate({ user: null });
                      Router.replace("/admin/login");

                      toast.closeAll();
                      toast({
                        description: "Berhasil logout",
                        status: "success",
                        duration: 4500,
                        position: "top-right",
                        isClosable: false,
                      });
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
