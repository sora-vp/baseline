import Head from "next/head";
import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const Status = () => {
  const candidateQuery = api.candidate.adminCandidateList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const counterQuery = api.candidate.getCandidateAndParticipantCount.useQuery(
    undefined,
    {
      refetchInterval: 2500,
      refetchIntervalInBackground: true,
    },
  );

  return (
    <>
      <Head>
        <title>Status Pemilihan</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Status Pemilihan
          </Text>
        </HStack>
        <HStack spacing={15}>
          {!candidateQuery.isLoading &&
          !candidateQuery.isError &&
          candidateQuery.data.length > 0 &&
          counterQuery.data ? (
            <Stack direction="row" mr="2" mt="3" mb="3">
              <Badge fontSize="1.3em">
                <Tooltip label="Jumlah suara masuk ke masing-masing kandidat terpilih">
                  Akumulasi Kandidat:
                </Tooltip>{" "}
                {counterQuery.data.candidates} Orang
              </Badge>
              <Badge fontSize="1.3em">
                <Tooltip label="Jumlah peserta pemilihan yang valid dalam memilih kandidat">
                  Akumulasi Pemilih:
                </Tooltip>{" "}
                {counterQuery.data.participants} Orang
              </Badge>
              <Badge
                fontSize="1.3em"
                colorScheme={counterQuery.data.isMatch ? "green" : "red"}
                variant="solid"
              >
                <Tooltip
                  label={
                    counterQuery.data.isMatch
                      ? "Jumlah peserta yang berhasil memilih sesuai dengan jumlah keseluruhan kandidat"
                      : "Jumlah peserta yang berhasil memilih tidak sesuai dengan jumlah keseluruhan kandidat"
                  }
                >
                  {counterQuery.data.isMatch ? "COCOK!" : "TIDAK COCOK!"}
                </Tooltip>
              </Badge>
            </Stack>
          ) : null}

          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Flex
              flexDirection="column"
              justifyContent="center"
              mx={"2em"}
              my={"2em"}
              height="100%"
            >
              <Tooltip label="Jumlah suara masuk ke masing-masing kandidat terpilih">
                <Text fontWeight={500} fontSize={"30px"}>
                  Akumulasi Kandidat
                </Text>
              </Tooltip>

              <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={5}
              >
                {!candidateQuery.isLoading &&
                !candidateQuery.isError &&
                candidateQuery.data.length > 0 &&
                counterQuery.data ? (
                  <Text fontWeight={800} fontSize={"29px"}>
                    {counterQuery.data.candidates} Orang
                  </Text>
                ) : (
                  <>
                    <Text fontWeight={800} fontSize={"29px"}>
                      N/A
                    </Text>

                    <Text>Belum di setup.</Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Box>

          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Flex
              flexDirection="column"
              justifyContent="center"
              mx={"2em"}
              my={"2em"}
              height="100%"
            >
              <Tooltip label="Jumlah peserta pemilihan yang valid dalam memilih kandidat">
                <Text fontWeight={500} fontSize={"30px"}>
                  Akumulasi Pemilih
                </Text>
              </Tooltip>

              <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={5}
              >
                {!candidateQuery.isLoading &&
                !candidateQuery.isError &&
                candidateQuery.data.length > 0 &&
                counterQuery.data ? (
                  <Text fontWeight={800} fontSize={"29px"}>
                    {counterQuery.data.participants} Orang
                  </Text>
                ) : (
                  <>
                    <Text fontWeight={800} fontSize={"29px"}>
                      N/A
                    </Text>

                    <Text>Belum di setup.</Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Box>

          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Flex
              flexDirection="column"
              justifyContent="center"
              mx={"2em"}
              my={"2em"}
              height="100%"
            >
              <Tooltip label="Kecocokan jumlah data peserta yang sudah memilih dengan jumlah pertambahan seluruh kandidat">
                <Text fontWeight={500} fontSize={"30px"}>
                  Kecocokan Data
                </Text>
              </Tooltip>

              <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={5}
              >
                {!candidateQuery.isLoading &&
                !candidateQuery.isError &&
                candidateQuery.data.length > 0 &&
                counterQuery.data ? (
                  <Badge
                    fontSize="1.3em"
                    colorScheme={counterQuery.data.isMatch ? "green" : "red"}
                    variant="solid"
                  >
                    <Tooltip
                      label={
                        counterQuery.data.isMatch
                          ? "Jumlah peserta yang berhasil memilih sesuai dengan jumlah keseluruhan kandidat"
                          : "Jumlah peserta yang berhasil memilih tidak sesuai dengan jumlah keseluruhan kandidat"
                      }
                    >
                      {counterQuery.data.isMatch ? "COCOK!" : "TIDAK COCOK!"}
                    </Tooltip>
                  </Badge>
                ) : (
                  <>
                    <Text fontWeight={800} fontSize={"29px"}>
                      N/A
                    </Text>

                    <Text>Belum di setup.</Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Box>
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(Status);
