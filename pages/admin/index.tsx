import { Text } from "@chakra-ui/react";
import { useEffect } from "react";

import { formatTime } from "@/lib/utils";
import { useUser } from "@/lib/hooks";
import Router from "next/router";

import Sidebar from "@/component/Sidebar";

import type { NextPage } from "next";

const Admin: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <Text>Dashboard Admin</Text>
      <Text>Informasi Anda</Text>
      <Text>Nama: {user?.username || "N/A"}</Text>
      <Text>Email: {user?.email || "N/A"}</Text>
      <Text>
        Tanggal Pendaftaran: {(user?.date && formatTime(user.date)) || "N/A"}
      </Text>
    </Sidebar>
  );
};

export default Admin;
