import {
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Text,
  Link,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useUser, usePaslon } from "@/lib/hooks";
import Router from "next/router";
import NextLink from "next/link";

import Sidebar from "@/component/Sidebar/index";

import type { NextPage } from "next";

const Statistik: NextPage = () => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const container = useRef<HTMLDivElement>(null!);

  const [user] = useUser();
  const [paslon, { loading }] = usePaslon({ refreshInterval: 250 });
  const chartData = useMemo(
    () =>
      paslon?.map((pasangan) => ({
        name: `${pasangan.ketua} - ${pasangan.wakil}`,
        ["Yang Memilih"]: pasangan.memilih,
      })),
    [paslon]
  );

  const tooltipColor = useColorModeValue("white", "#171923");
  const yangMemilihColor = useColorModeValue("#2F855A", "#38A169");

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  useEffect(() => {
    const setSize = () => {
      setWidth(container.current.clientWidth - 50);
      setHeight(container.current.clientHeight - 13);
    };
    setSize();

    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

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
            ref={container}
          >
            <VStack
              align="stretch"
              px={2}
              py={2}
              style={{
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!paslon && !loading ? (
                <HStack>
                  <Text fontSize={"3xl"} style={{ textAlign: "center" }}>
                    Belum ada paslon, buat terlebih dahulu di{" "}
                    <NextLink href={"/admin/paslon"} passHref>
                      <Link color="teal.500">halaman paslon</Link>
                    </NextLink>
                    !
                  </Text>
                </HStack>
              ) : (
                <BarChart width={width} height={height} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipColor,
                      borderColor: tooltipColor,
                      borderRadius: "2mm",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Yang Memilih" fill={yangMemilihColor} />
                </BarChart>
              )}
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </Sidebar>
  );
};

export default Statistik;
