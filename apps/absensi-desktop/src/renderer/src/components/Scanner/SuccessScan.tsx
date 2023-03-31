import { useEffect } from "react";
import { Box, HStack, Heading } from "@chakra-ui/react";

import { trpc } from "@renderer/utils/trpc";

const SuccessScan = ({
  participantAttend,
}: {
  participantAttend: ReturnType<
    typeof trpc.participant.participantAttend.useMutation
  >;
}) => {
  useEffect(() => {
    setTimeout(() => participantAttend.reset(), 5_000);
  }, []);

  return (
    <HStack h={"100vh"} justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        backgroundColor="green.500"
        style={{
          display: "flex",
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          gap: "1em",
        }}
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Heading as="h1" size="4xl" fontSize="5rem" color={"white"}>
          Berhasil Absen!
        </Heading>
        <Heading
          as="h2"
          size="xl"
          color={"white"}
          fontWeight={"regular"}
          mt="2"
          maxW="19em"
          textAlign="center"
        >
          Silahkan menuju ke komputer pemilihan dan gunakan hak suara anda!
        </Heading>
      </Box>
    </HStack>
  );
};

export default SuccessScan;
