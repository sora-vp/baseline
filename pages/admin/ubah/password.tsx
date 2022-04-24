import Head from "next/head";
import NextLink from "next/link";

import { commonSSRCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

const UbahPassword = () => {
  return (
    <>
      <Head>
        <title>Ubah Password</title>
      </Head>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<commonComponentInterface> =
  commonSSRCallback;

export default Sidebar(UbahPassword);
