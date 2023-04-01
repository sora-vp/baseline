import { useState } from "react";
import {
    Box,
    Button,
    HStack,
    Heading,
    FormControl,
    FormLabel,
    FormHelperText,
    FormErrorMessage,
    Input,
} from "@chakra-ui/react";

interface IAppSetting {
    serverURL?: string;
    setServerUrl: (url: string) => void;
}

export const SettingWrapper = (useAppSetting: () => IAppSetting) => () => {
    const { serverURL, setServerUrl } = useAppSetting();

    const [formURL, setFormURL] = useState(serverURL ?? "");

    return (
        <HStack h={"100vh"} justifyContent="center">
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
                <Box w={"55%"}>
                    <Heading>Pengaturan Aplikasi</Heading>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            setServerUrl(formURL);
                        }}
                    >
                        <FormControl
                            marginTop="1.3rem"
                            marginBottom="1.3rem"
                            isRequired
                            isInvalid={formURL === ""}
                        >
                            <FormLabel>Alamat Server Utama</FormLabel>
                            <Input
                                type="url"
                                value={formURL}
                                placeholder="Semisal http://localhost:3000"
                                onChange={(e) => setFormURL(e.target.value)}
                            />
                            {formURL !== "" ? (
                                <FormHelperText>
                                    Masukan alamat server utama aplikasi sora supaya aplikasi ini
                                    bisa berjalan.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>Diperlukan alamat server.</FormErrorMessage>
                            )}
                        </FormControl>

                        <Button type="submit" w={"100%"} colorScheme="green">
                            Simpan
                        </Button>
                    </form>
                </Box>
            </Box>
        </HStack>
    );
};

