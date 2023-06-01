import QrScanner from "qr-scanner";
import { validateId } from "@sora/id-generator";
import { useRef, useEffect } from "react";

import { useToast, Box, Text, HStack } from "@chakra-ui/react";
import styles from "@renderer/styles/components/Scanner.module.css";

import { trpc } from "@renderer/utils/trpc";

const NormalScanner = ({
  setInvalidQr,
  participantAttend,
}: {
  setInvalidQr: (invalid: boolean) => void;
  participantAttend: ReturnType<
    typeof trpc.participant.participantAttend.useMutation
  >;
}) => {
  const toast = useToast();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        // Bug from QR Scanner
        if (!data || data === "") return;

        qrScanner.stop();

        const isValidQr = validateId(data);

        if (!isValidQr) return setInvalidQr(true);

        participantAttend.mutate(data);
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
        onDecodeError: (error) => {
          if (error instanceof Error)
            toast({
              description: `Error: ${error.message}`,
              status: "error",
              duration: 5000,
              position: "top-right",
            });
        },
      }
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
