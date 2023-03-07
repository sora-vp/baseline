import {
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Text,
  Link,
  Spinner,
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
import NextLink from "next/link";

import { trpc } from "../../utils/trpc";

import Sidebar from "../../components/Sidebar";

const Statistik = () => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const container = useRef<HTMLDivElement>(null!);

  const paslonQuery = trpc.paslon.adminCandidateList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const chartData = useMemo(
    () =>
      paslonQuery.data?.map((kandidat) => ({
        name: kandidat.namaKandidat,
        ["Yang Memilih"]: kandidat.dipilih,
      })),
    [paslonQuery.data]
  );

  const tooltipColor = useColorModeValue("white", "#171923");
  const yangMemilihColor = useColorModeValue("#2F855A", "#38A169");

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
    <>
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
              {paslonQuery.isLoading && <Spinner thickness="4px" size="xl" />}

              {!paslonQuery.isLoading &&
                paslonQuery.data &&
                paslonQuery.data.length < 1 && (
                  <HStack>
                    <Text fontSize={"3xl"} style={{ textAlign: "center" }}>
                      Belum ada paslon, buat terlebih dahulu di{" "}
                      <NextLink href={"/admin/paslon"} passHref>
                        <Link color="teal.500">halaman paslon</Link>
                      </NextLink>
                      !
                    </Text>
                  </HStack>
                )}

              {!paslonQuery.isLoading &&
                paslonQuery.data &&
                paslonQuery.data.length > 0 && (
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
    </>
  );
};

export default Sidebar(Statistik);
