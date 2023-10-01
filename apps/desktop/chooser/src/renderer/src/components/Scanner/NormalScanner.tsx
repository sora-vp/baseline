import { useEffect, useRef } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import styles from "@renderer/styles/components/Scanner.module.css";
import { trpc } from "@renderer/utils/trpc";
import QrScanner from "qr-scanner";

import { validateId } from "@sora/id-generator";

const NormalScanner = ({
  setInvalidQr,
  checkParticipantMutation,
}: {
  setInvalidQr: (invalid: boolean) => void;
  checkParticipantMutation: ReturnType<
    typeof trpc.participant.isParticipantAlreadyAttended.useMutation
  >;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      async ({ data }) => {
        if (data || data !== "") {
          qrScanner.stop();

          const isValidQr = validateId(data);

          if (!isValidQr) return setInvalidQr(true);

          checkParticipantMutation.mutate(data);
        }
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
      },
    );

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  return (
    <HStack h="100vh" justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        display="flex"
        boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
        alignItems="center"
        justifyContent="center"
      >
        <HStack
          flexDirection="column"
          h="100%"
          w="80%"
          alignItems="center"
          justifyContent="center"
        >
          <Box h="85%">
            <video className={styles.video} ref={videoRef}></video>
          </Box>
          <Box h="auto">
            <Text fontWeight="bold" p={"1em"} fontSize="1.2em">
              Scan Barcode ID Mu!
            </Text>
          </Box>
        </HStack>
      </Box>
    </HStack>
  );
};

export default NormalScanner;
