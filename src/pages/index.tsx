import Head from "next/head";
import Router from "next/router";
import type { NextPage } from "next";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  useToast,
  useDisclosure,
  Container,
  Box,
  Text,
  Divider,
  VStack,
  HStack,
  Image,
  Center,
  Heading,
  Button,
  Spinner,

  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Types } from "mongoose";

import { trpc } from "../utils/trpc";

let intervalID: NodeJS.Timeout;

const Home: NextPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null!);
  const sendRef = useRef<HTMLButtonElement>(null!);

  // Untuk keperluan pemilihan
  const [currentID, setID] = useState<Types.ObjectId | null>(null);

  const [canVote, setCanVote] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getTime());

  const [waktuMulai, setWaktuMulai] = useState<number | null>(null);
  const [waktuSelesai, setWaktuSelesai] = useState<number | null>(null);

  const userInfo = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const candidateQuery = trpc.candidate.candidateList.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,

    onSuccess(result) {
      setWaktuMulai(
        result.startTime
          ? DateTime.fromISO(result.startTime as unknown as string)
              .toLocal()
              .toJSDate()
              .getTime()
          : null
      );
      setWaktuSelesai(
        result.endTime
          ? DateTime.fromISO(result.endTime as unknown as string)
              .toLocal()
              .toJSDate()
              .getTime()
          : null
      );
      setCanVote(result.canVote);
    },
  });

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

      sendRef.current.setAttribute("disabled", "");

      if (settingsQuery.data?.reloadAfterVote)
        setTimeout(() => Router.reload(), 500);
    },

    onError(result) {
      toast({
        description: result.message,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const canVoteNow = useMemo(
    () =>
      (waktuMulai as number) <= currentTime &&
      (waktuSelesai as number) >= currentTime &&
      canVote,
    [waktuMulai, waktuSelesai, currentTime, canVote]
  );

  const getNama = () => {
    const currentCandidate =
      candidateQuery.data &&
      candidateQuery.data?.find((p) => p.id === currentID);

    return currentCandidate?.namaKandidat;
  };

  useEffect(() => {
    function updateTime() {
      setCurrentTime(new Date().getTime());
    }
    updateTime();

    intervalID = setInterval(updateTime, 5000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  if (userInfo.isLoading || candidateQuery.isLoading)
    return (
      <>
        <Head>
          <title>Loading | ᮞᮧᮛ</title>
        </Head>

        <HStack h={"100vh"} justifyContent="center">
          <Box
            borderWidth="2px"
            borderRadius="lg"
            w="85%"
            h="90%"
            style={{
              display: "flex",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
            }}
            alignItems="center"
            justifyContent="center"
          >
            <Spinner thickness="4px" size="xl" />
            <Text ml="2em">Mengambil data terbaru...</Text>
          </Box>
        </HStack>
      </>
    );

  if (userInfo.data || !canVoteNow)
    return (
      <>
        <Head>
          <title>Tidak Diizinkan untuk Memilih | ᮞᮧᮛ</title>
        </Head>

        <TidakDiizinkanMemilih />
      </>
    );

  return (
    <>
      <Head>
        <title>Pilih Kandidat Mu | ᮞᮧᮛ</title>
      </Head>

      {candidateQuery.data && candidateQuery.data.length > 0 ? (
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
            {candidateQuery.data?.map((paslon) => (
              <Center key={paslon.imgName} py={6}>
                <Box
                  maxW={"320px"}
                  w={"full"}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  textAlign={"center"}
                >
                  <Image
                    src={`/api/uploads/${paslon.imgName}`}
                    alt={`Gambar dari pasangan calon ${paslon.namaKandidat}.`}
                  />
                  <Heading mt={2} fontSize={"3xl"} fontFamily={"body"}>
                    Pasangan Calon
                  </Heading>
                  <Text fontSize={"1.4rem"} mt={2}>
                    {paslon.namaKandidat}
                  </Text>

                  <Button
                    onClick={() => {
                      setID(paslon.id);
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
                  Apakah anda yakin untuk memilih kandidat atas nama {getNama()}
                  ?
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
                    ref={sendRef}
                    onClick={() => {
                      sendRef.current.setAttribute("disabled", "disabled");
                      candidateMutation.mutate({
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
      ) : (
        <MasihKosong />
      )}
    </>
  );
};

const MasihKosong = () => (
  <Container>
    <Box p={4} borderWidth="1px" mt="6" borderRadius="lg">
      <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
        Tidak Ada Data PASLON
      </Text>
      <Divider orientation="horizontal" mt="1" mb="1" />
      <Text>
        Tidak ada data kandidat yang ada, mohon hubungi admin untuk menambahkan
        data paslon.
      </Text>
    </Box>
  </Container>
);

const TidakDiizinkanMemilih = () => (
  <HStack h={"100vh"} justifyContent="center">
    <Box
      borderWidth="2px"
      borderRadius="lg"
      w="85%"
      h="90%"
      style={{
        display: "flex",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      }}
      alignItems="center"
      justifyContent="center"
    >
      <Heading size="lg" fontSize="50px" fontWeight="semibold" color="gray.900">
        Tidak <Text color="red">Di izinkan</Text>
        Untuk memilih!
      </Heading>
    </Box>
  </HStack>
);

export default Home;
