import { useUser } from "@/lib/hooks";
import type { NextPage } from "next";

import Router from "next/router";

import { useEffect } from "react";

const Admin: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return <p>Admin Page</p>;
};

export default Admin;
