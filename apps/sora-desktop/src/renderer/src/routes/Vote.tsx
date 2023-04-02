import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  useToast,
  useDisclosure,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Image,
  Button,
  Card,
  CardBody,
  CardFooter,

  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { Navigate } from "react-router-dom";

import Loading from "@renderer/components/PreScan/Loading";
import { useAppSetting } from "@renderer/context/AppSetting";
import { useSetting } from "@renderer/context/SettingContext";

import {
  useParticipant,
  ensureParticipantIsValidVoter,
} from "@renderer/context/ParticipantContext";

import { trpc } from "@renderer/utils/trpc";

const Vote: React.FC = () => {
  const toast = useToast();

  const { qrId, setQRCode } = useParticipant();
  const { serverURL } = useAppSetting();
  const { isLoading, isError, canVoteNow, candidates } = useSetting();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cancelRef = useRef<HTMLButtonElement>(null!);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sendRef = useRef<HTMLButtonElement>(null!);

  // Untuk keperluan pemilihan
  const [currentID, setID] = useState<number | null>(null);

  const candidateMutation = trpc.candidate.upvote.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      onClose();
      setQRCode(null);
    },

    onError(result) {
      toast({
        description: `Gagal memilih, Error: ${result.message}`,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const cannotPushAKeyboard = useMemo(
    () =>
      !qrId ||
      !canVoteNow ||
      candidateMutation.isSuccess ||
      candidateMutation.isError ||
      candidateMutation.isLoading ||
      (candidates && candidates.length === 0),
    [
      qrId,
      canVoteNow,
      candidateMutation.isError,
      candidateMutation.isLoading,
      candidateMutation.isSuccess,
    ]
  );

  const chooseCandidate = useCallback(() => {
    if (qrId) {
      sendRef.current.setAttribute("disabled", "disabled");
      candidateMutation.mutate({
        id: currentID as number,
        qrId,
      });
    }
  }, [candidateMutation, currentID]);

  const getNama = () => {
    const currentCandidate =
      candidates && candidates?.find((p) => p.id === currentID);

    return currentCandidate?.name;
  };

  useEffect(() => {
    const triggerBox = (index: number) => {
      const candidateData =
        candidates && candidates.length > 0 && candidates[index];

      if (!isOpen && candidateData) {
        setID(candidateData.id);
        onOpen();
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (cannotPushAKeyboard) return;

      switch (e.key) {
        case "Escape":
          if (isOpen) onClose();
          break;

        case "1":
          triggerBox(0);
          break;

        case "2":
          triggerBox(1);
          break;

        case "3":
          triggerBox(2);
          break;

        case "4":
          triggerBox(3);
          break;

        case "5":
          triggerBox(4);
          break;

        case "Enter":
          if (isOpen) chooseCandidate();
          break;
      }
    };

    window.addEventListener("keyup", onKeydown);

    return () => {
      window.removeEventListener("keyup", onKeydown);
    };
  }, [cannotPushAKeyboard, isOpen]);

  if (isLoading) return <Loading />;

  if (!canVoteNow || isError) return <Navigate to={"/"} />;

  return (
    <VStack align="stretch" mt={3}>
      <HStack style={{ justifyContent: "center" }}>
        <Text fontWeight="500" fontSize="4xl">
          Pilih Kandidatmu!
        </Text>
      </HStack>
      <HStack
        spacing={4}
        style={{
          paddingLeft: "9px",
          paddingRight: "9px",
          paddingTop: "15px",
          margin: "0 auto",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {candidates?.map((kandidat, idx) => (
          <Card maxW="265px" key={kandidat.id}>
            <CardBody>
              <Image
                w="100%"
                src={`${serverURL as string}/api/uploads/${kandidat.img}`}
                alt={`Gambar dari kandidat ${kandidat.name}.`}
              />
              <Stack textAlign="center">
                <Heading mt={2} as="h3" size="lg" fontFamily={"body"}>
                  Nomor Urut {++idx}
                </Heading>
                <Text fontSize={"1.4rem"} mt={2}>
                  {kandidat.name}
                </Text>
              </Stack>
            </CardBody>

            <CardFooter>
              <Button
                onClick={() => {
                  setID(kandidat.id);
                  onOpen();
                }}
                w="100%"
                colorScheme="green"
                variant="solid"
                mb={4}
                fontSize={"1.3rem"}
                onFocus={(e) => e.target.blur()}
              >
                Pilih
              </Button>
            </CardFooter>
          </Card>
        ))}
      </HStack>

      <AlertDialog
        autoFocus={false}
        trapFocus={false}
        isCentered
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!candidateMutation.isLoading) {
            setID(null);
            onClose();
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Pilih Paslon
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin untuk memilih kandidat atas nama {getNama()}?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={candidateMutation.isLoading}
              >
                Batal
              </Button>
              <Button
                ml={3}
                ref={sendRef}
                colorScheme="green"
                onClick={chooseCandidate}
                disabled={candidateMutation.isLoading}
              >
                Pilih
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default ensureParticipantIsValidVoter(Vote);
