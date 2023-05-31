import { useState } from "react";
import Head from "next/head";
import {
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  Input,
  Link,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { BsMoonFill, BsSun } from "react-icons/bs";

import { api } from "~/utils/api";

const PDFPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [categoryValue, setCategory] = useState<string>("");
  const [mainWeb, setMainWeb] = useState<string>("");

  const categoriesQuery = api.participant.categories.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const participantByCategoryQuery =
    api.participant.getParticipantByCategory.useQuery(
      {
        category: categoryValue,
      },
      {
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    );

  return (
    <>
      <Head>
        <title>Cetak PDF</title>
      </Head>

      <style jsx global>{`
        @media print {
          .not-for-print {
            display: none;
          }
        }
      `}</style>

      <Flex marginLeft="10" marginRight="10" flexDirection="column">
        <VStack mt="3">
          <Heading>Peserta Pemilihan</Heading>
        </VStack>

        <HStack mt="3" w="fit-content" className="not-for-print">
          <Button
            onClick={(e) => {
              (e.target as HTMLButtonElement).blur();
              toggleColorMode();
            }}
          >
            <Icon
              fontSize="16"
              as={colorMode === "light" ? BsSun : BsMoonFill}
            />
          </Button>
          <Select
            placeholder="Pilih kategori peserta pemilihan"
            value={categoryValue}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoriesQuery.data?.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Web QR Code | Misal https://example.com"
            value={mainWeb}
            onChange={(e) => setMainWeb(e.target.value)}
          />
          <Button
            w="12em"
            isDisabled={
              categoriesQuery.isLoading ||
              categoryValue === "" ||
              mainWeb === ""
            }
            colorScheme="orange"
            onClick={() => window.print()}
          >
            Print PDF
          </Button>
        </HStack>

        <Table mt="5" mb="10" variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Nama</Th>
              <Th>QR ID</Th>
              <Th>Link QR</Th>
            </Tr>
          </Thead>
          <Tbody>
            {participantByCategoryQuery.data?.participants.map(
              (participant, idx) => (
                <Tr key={idx}>
                  <Td>{++idx}</Td>
                  <Td>
                    {participant.name
                      .replace(categoryValue, "")
                      .replace("|", "")
                      .trim()}
                  </Td>
                  <Td>
                    <Text as="pre">{participant.qrId}</Text>
                  </Td>
                  <Td>
                    <Link
                      href={`${mainWeb}/qr/${participant.qrId}`}
                      isExternal
                      color="blue.500"
                    >
                      Klik Disini
                    </Link>
                  </Td>
                </Tr>
              ),
            )}
          </Tbody>
        </Table>
      </Flex>
    </>
  );
};

export default PDFPage;
