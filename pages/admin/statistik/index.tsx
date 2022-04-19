import { VStack, HStack, Box, Text } from "@chakra-ui/react";
import { useEffect } from "react";

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
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Statistik
          </Text>
        </HStack>

        <HStack h={"80vh"}>
          <Box
            bg="white"
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
