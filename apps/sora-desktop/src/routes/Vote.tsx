import { useState, useRef } from "react";
import {
  useToast,
  useDisclosure,
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Center,
  Heading,
  Button,

  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { Types } from "mongoose";
import { DateTime } from "luxon";
import { Navigate } from "react-router-dom";


import Loading from "@/components/PreScan/Loading";
import { useAppSetting } from "@/context/AppSetting";
import { useSetting } from "@/context/SettingContext";

import {
  useParticipant,
  ensureParticipantIsValidVoter,
} from "@/context/ParticipantContext";

import { trpc } from "@/utils/trpc";

const Vote: React.FC = () => {
  const toast = useToast();

  const { qrId, setQRCode } = useParticipant();
  const { soraURL } = useAppSetting();
  const { isLoading, isError, canVoteNow, candidate } = useSetting();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null!);

  // Untuk keperluan pemilihan
  const [currentID, setID] = useState<Types.ObjectId | null>(null);

  const candidateMutation = trpc.sora.candidate.upvote.useMutation({
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

  const getNama = () => {
    const currentCandidate =
      candidate &&
      candidate?.find((p) => p.id === currentID);

    return currentCandidate?.namaKandidat;
  };


  if (isLoading) return <Loading />;

  if (!canVoteNow || isError) return <Navigate to={"/"} />;

  return (
    <VStack align="stretch" mt={3}>
      <HStack style={{ justifyContent: "center" }}>
        <Text fontWeight="500" fontSize="4xl">
          Pilih Ketua Barumu!
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
        {candidate &&
          candidate.map((kandidat) => (
            <Center key={kandidat.imgName} py={6}>
              <Box
                maxW={"320px"}
                w={"full"}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                textAlign={"center"}
              >
                <Image
                  src={`${soraURL as string}/api/uploads/${kandidat.imgName}`}
                  alt={`Gambar dari kandidat ${kandidat.namaKandidat}.`}
                />
                <Heading mt={2} fontSize={"3xl"} fontFamily={"body"}>
                  Pasangan Calon
                </Heading>
                <Text fontSize={"1.4rem"} mt={2}>
                  {kandidat.namaKandidat}
                </Text>

                <Button
                  onClick={() => {
                    setID(kandidat.id);
                    onOpen();
                  }}
                  colorScheme="green"
                  variant="solid"
                  mb={4}
                >
                  Pilih
                </Button>
              </Box>
            </Center>
          ))}
      </HStack>

      <AlertDialog
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
              Apakah anda yakin untuk memilih paslon atas nama {getNama()}?
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
                colorScheme="green"
                disabled={candidateMutation.isLoading}
                onClick={() => {
                  candidateMutation.mutate({
                    qrId: qrId as string,
                    id: currentID as unknown as string,
                    timeZone: DateTime.now().zoneName,
                  });
                }}
                ml={3}
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
