import QrScanner from "qr-scanner";
import { validateId } from "id-generator";
import { useRef, useState, useEffect } from "react";

import { useToast, Box, Text, HStack } from "@chakra-ui/react";
import styles from "@/styles/components/Scanner.module.css";

import SuccessScan from "./SuccessScan";

import { trpc } from "@/utils/trpc";

const NormalScanner: React.FC<{ setInvalidQr: Function }> = ({
  setInvalidQr,
}) => {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null!);

  const [isSuccess, setSuccess] = useState<boolean>(false);

  const participantAttend = trpc.participant.participantAttend.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        position: "top-right",
        status: "success",
        duration: 8000,
        isClosable: false,
      });

      setSuccess(true);
      setTimeout(() => location.reload(), 2500);
    },
    onError(result) {
      toast({
        description: result.message,
        position: "top-right",
        status: "error",
        duration: 8000,
        isClosable: false,
      });

      setInvalidQr(true);
    },
  });

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
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

  if (isSuccess) return <SuccessScan />;

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
