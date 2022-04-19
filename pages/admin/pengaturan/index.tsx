import { VStack, HStack, Text } from "@chakra-ui/react";
import { useEffect } from "react";

import { useUser } from "@/lib/hooks";
import Router from "next/router";

import Sidebar from "@/component/Sidebar/index";

import type { NextPage } from "next";

const Pengaturan: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Pengaturan
          </Text>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default Pengaturan;
