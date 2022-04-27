import { useMemo, useEffect } from "react";
import { Types } from "mongoose";
import Router from "next/router";

import { usePaslon, useSettings } from "@/lib/hooks";

import { getBaseUrl } from "@/lib/utils";
import { ssrCallback } from "@/lib/csrf";
import { GetServerSideProps } from "next";
import Sidebar from "@/component/Sidebar";

import type { IPaslon } from "@/models/Paslon";
import type { TModelApiResponse } from "@/lib/settings";

type PaslonType = commonComponentInterface & {
  paslon: IPaslon[];
  settingsFallback: TModelApiResponse | null;
  paslonID: Types.ObjectId;
};

const EditPaslonWithID = ({
  paslon: paslonFallback,
  settingsFallback,
  paslonID,
}: PaslonType) => {
  const [paslon] = usePaslon({ fallbackData: paslonFallback });
  const [settings] = useSettings({ fallbackData: settingsFallback });

  const currentPaslon = useMemo(
    () => paslon?.find((peserta) => peserta._id === paslonID),
    [paslon, paslonID]
  );

  useEffect(() => {
    if (settings.canVote) Router.push("/admin/paslon");
  }, [settings]);

  return <></>;
};

export const getServerSideProps: GetServerSideProps<PaslonType> = async ({
  req,
  res,
  params,
}) => {
  const { id } = params as unknown as { id: Types.ObjectId };

  const baseUrl = getBaseUrl(req);
  await ssrCallback({ req, res });

  const [{ paslon }, pengaturan] = await Promise.all([
    fetch(`${baseUrl}/api/vote`).then((res) => res.json()),
    fetch(`${baseUrl}/api/settings`).then((res) => res.json()),
  ]);

  if (
    pengaturan.canVote ||
    !paslon ||
    !Types.ObjectId.isValid(id) ||
    !paslon.find((peserta: IPaslon) => peserta._id === id)
  ) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/paslon",
      },
    };
  }

  return {
    props: {
      paslonID: id as Types.ObjectId,
      settingsFallback: pengaturan ? pengaturan : null,
      paslon: paslon ? paslon : null,
      csrfToken: (req as unknown as { csrfToken(): string }).csrfToken(),
    },
  };
};

export default Sidebar(EditPaslonWithID);
