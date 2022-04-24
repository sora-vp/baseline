import { VStack, HStack, Text } from "@chakra-ui/react";
import Head from "next/head";

import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

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
      </VStack>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Sidebar(Pengaturan);
