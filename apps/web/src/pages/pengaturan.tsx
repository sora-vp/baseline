import Head from "next/head";
import { HStack, Text, VStack } from "@chakra-ui/react";

import Sidebar from "~/components/Sidebar";
import PengaturanPerilaku from "~/components/pages/admin/PengaturanPerilaku";
import PengaturanWaktu from "~/components/pages/admin/PengaturanWaktu";

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
          <PengaturanWaktu />
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(Pengaturan);
