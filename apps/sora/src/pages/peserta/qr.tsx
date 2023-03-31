import Head from "next/head";
import {
    useColorModeValue,
    VStack,
    HStack,
    Box,
    Text,

    Input,
    FormLabel,
    FormControl,
    FormHelperText
} from "@chakra-ui/react";
import QRCode from "qrcode";
import debounce from "lodash/debounce";
import { useCallback, useRef, useState } from "react";

import Sidebar from "~/components/Sidebar";

const QRCodePage = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvasRef = useRef<HTMLCanvasElement>(null!);

    const [qrInput, setQrInput] = useState("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFn = useCallback(debounce((qrValue: string) => {
        if (qrValue === "") {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            return;
        }

        QRCode.toCanvas(canvasRef.current, qrValue, { width: 296 });
    }, 500), []);

    return (<>
        <Head>
            <title>Buat QR</title>
        </Head>
        <VStack align="stretch">
            <HStack mb={"10px"} style={{ justifyContent: "center" }}>
                <Text fontWeight="500" fontSize="5xl">
                    Buat QR Dadakan
                </Text>
            </HStack>

            <HStack h={"80vh"}>
                <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    h={"100%"}
                    w={"100%"}
                >
                    <VStack
                        m="10"
                    >
                        <FormControl>
                            <FormLabel>Text QR Code</FormLabel>
                            <Input value={qrInput} onChange={(e) => {
                                setQrInput(e.target.value.trim());
                                debouncedFn(e.target.value.trim())
                            }} />
                            <FormHelperText>Masukan text QR ID yang ingin dijadikan gambar QR Code</FormHelperText>
                        </FormControl>

                        <canvas ref={canvasRef} style={{ marginTop: "1.6em" }}></canvas>
                    </VStack>
                </Box>
            </HStack>
        </VStack>
    </>)
}

export default Sidebar(QRCodePage);