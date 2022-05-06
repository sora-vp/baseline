import { VStack, HStack, Text } from "@chakra-ui/react";
import Head from "next/head";

import { getBaseUrl } from "@/lib/utils";
import { ssrCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";
import { useSettings } from "@/lib/hooks";

import type { TModelApiResponse } from "@/lib/settings";

import PengaturanWaktu from "@/component/pages/admin/PengaturanWaktu";
import PengaturanPerilaku from "@/component/pages/admin/PengaturanPerilaku";

type PengaturanType = {
  settingsFallback: TModelApiResponse | null;
} & commonComponentInterface;

const Pengaturan = ({ csrfToken, settingsFallback }: PengaturanType) => {
  const settings = useSettings({
    fallbackData: settingsFallback,
  });

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
          <PengaturanWaktu settingsObject={settings} csrfToken={csrfToken} />
          <PengaturanPerilaku settingsObject={settings} csrfToken={csrfToken} />
        </HStack>
      </VStack>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PengaturanType> = async ({
  req,
  res,
}) => {
  const baseUrl = getBaseUrl();
  await ssrCallback({ req, res });

  const response = await fetch(`${baseUrl}/api/settings`);
  const pengaturan = await response.json();

  return {
    props: {
      settingsFallback: pengaturan ? pengaturan : null,
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export default Sidebar(Pengaturan);
