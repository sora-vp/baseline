import { useColorModeValue, VStack, HStack, Box, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import Head from "next/head";

import { useUser } from "@/lib/hooks";
import Router from "next/router";

import Sidebar from "@/component/Sidebar/index";

import type { NextPage } from "next";

const Statistik: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <Head>
        <title>Statistik Pemilihan</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Statistik
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
            <VStack align="stretch" px={2} py={2}></VStack>
          </Box>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default Statistik;
