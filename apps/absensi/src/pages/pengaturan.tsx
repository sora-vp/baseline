import { VStack, HStack, Text } from "@chakra-ui/react";
import Head from "next/head";

import Sidebar from "@components/Sidebar";
import PengaturanPerilaku from "@components/Pengaturan/PengaturanPerilaku";

const Pengaturan = () => {
  return (
    <>
      <Head>
        <title>Pengaturan</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Pengaturan
          </Text>
        </HStack>
        <HStack spacing={15}>
          <PengaturanPerilaku />
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(Pengaturan);
