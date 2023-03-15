import Head from "next/head";
import Router from "next/router";
import type { NextPage } from "next";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  useDisclosure,
  Text,
  VStack,
  HStack,
  Image,
  Heading,
  Button,
  Spinner,

  // Card
  Card,
  CardBody,
  CardFooter,
  Stack,

  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Types } from "mongoose";

import { trpc } from "../utils/trpc";
import {
  BerhasilMemilihDanCapJari,
  MasihKosong,
  MutationErrorBox,
  TidakDiizinkanMemilih,
} from "../components/Home";

let intervalID: NodeJS.Timeout;

const Home: NextPage = () => {
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
    onSuccess() {
      onClose();

      sendRef.current.setAttribute("disabled", "");

      setTimeout(() => {
        if (settingsQuery.data?.reloadAfterVote)
          setTimeout(() => Router.reload(), 500);
        else candidateMutation.reset();
      }, 12_000);
    },
  });

  const canVoteNow = useMemo(
    () =>
      (waktuMulai as number) <= currentTime &&
      (waktuSelesai as number) >= currentTime &&
      canVote,
    [waktuMulai, waktuSelesai, currentTime, canVote]
  );

  const cannotPushAKeyboard = useMemo(
    () =>
      userInfo.data ||
      !canVoteNow ||
      candidateMutation.isSuccess ||
      candidateMutation.isError ||
      candidateMutation.isLoading ||
      candidateQuery.isLoading ||
      userInfo.isLoading ||
      (candidateQuery.data && candidateQuery.data.length === 0),
    [
      canVoteNow,
      candidateMutation.isError,
      candidateMutation.isLoading,
      candidateMutation.isSuccess,
      candidateQuery.data,
      candidateQuery.isLoading,
      userInfo.data,
      userInfo.isLoading,
    ]
  );

  const chooseCandidate = useCallback(() => {
    sendRef.current.setAttribute("disabled", "disabled");
    candidateMutation.mutate({
      id: currentID as unknown as string,
      timeZone: DateTime.now().zoneName,
    });
  }, [candidateMutation, currentID]);

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

  useEffect(() => {
    const triggerBox = (index: number) => {
      const candidateData =
        candidateQuery.data &&
        candidateQuery.data.length > 0 &&
        candidateQuery.data[index];

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cannotPushAKeyboard, isOpen]);

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

  if (candidateMutation.isSuccess) return <BerhasilMemilihDanCapJari />;

  if (candidateMutation.isError)
    return <MutationErrorBox errorMessage={candidateMutation.error.message} />;

  return (
    <>
      <Head>
        <title>Pilih Kandidat Mu | ᮞᮧᮛ</title>
      </Head>

      {candidateQuery.data && candidateQuery.data.length > 0 ? (
        <VStack align="stretch" mt={3}>
          <HStack style={{ justifyContent: "center" }}>
            <Text fontWeight="500" fontSize="5xl">
              Pilih Kandidatmu!
            </Text>
          </HStack>
          <HStack
            spacing={2}
            style={{
              paddingLeft: "9px",
              paddingRight: "9px",
              paddingTop: "15px",
              margin: "0 auto",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {candidateQuery.data?.map((kandidat, idx) => (
              <Card maxW="265px" minH="583px" key={idx}>
                <CardBody>
                  <Image
                    w="100%"
                    src={`/api/uploads/${kandidat.imgName}`}
                    alt={`Gambar dari kandidat ${kandidat.namaKandidat}.`}
                  />
                  <Stack textAlign="center">
                    <Heading mt={2} as="h3" size="lg" fontFamily={"body"}>
                      Nomor Urut {++idx}
                    </Heading>
                    <Text fontSize={"1.4rem"} mt={2}>
                      {kandidat.namaKandidat}
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
                <AlertDialogHeader fontSize="3xl" fontWeight="bold">
                  Pilih Kandidat
                </AlertDialogHeader>

                <AlertDialogBody fontSize="xl">
                  Apakah anda yakin untuk memilih kandidat atas nama {getNama()}
                  ?
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    fontSize="xl"
                    ref={cancelRef}
                    onClick={onClose}
                    disabled={candidateMutation.isLoading}
                    onFocus={(e) => e.target.blur()}
                  >
                    Batal
                  </Button>
                  <Button
                    fontSize="xl"
                    colorScheme="green"
                    ref={sendRef}
                    onFocus={(e) => e.target.blur()}
                    onClick={chooseCandidate}
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

export default Home;
