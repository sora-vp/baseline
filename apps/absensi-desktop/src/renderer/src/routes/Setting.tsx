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

import { useAppSetting } from "@renderer/context/AppSetting";

const Setting: React.FC = () => {
  const { serverURL, setServerUrl } = useAppSetting();

  const [absensiURL, setAbsensiURL] = useState(serverURL ?? "");

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

              setServerUrl(absensiURL);
            }}
          >
            <FormControl
              marginTop="1.3rem"
              marginBottom="1.3rem"
              isRequired
              isInvalid={absensiURL === ""}
            >
              <FormLabel>Alamat Server Absensi</FormLabel>
              <Input
                type="url"
                value={absensiURL}
                placeholder="Semisal http://localhost:3001"
                onChange={(e) => setAbsensiURL(e.target.value)}
              />
              {absensiURL !== "" ? (
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

export default Setting;
