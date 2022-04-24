import useSWR, { KeyedMutator } from "swr";
import { DateTime } from "luxon";

import type { IPaslon } from "@/models/Paslon";
import type { SWRConfiguration } from "swr";

export type UserType = { email: string; username: string; date: DateTime };
export type useUserType = [
  UserType | null,
  {
    mutate: KeyedMutator<{
      user: { email: string; username: string; date: Date } | null;
    }>;
    loading: boolean;
  }
];

export function useUser(): useUserType {
  const { data, mutate } = useSWR("/api/user");

  const loading = !data;
  const user: UserType = data?.user
    ? { ...data.user, date: DateTime.fromISO(data.user.date).toLocal() }
    : data?.user;
  return [user, { mutate, loading }];
}

export type usePaslonType = [
  IPaslon[] | null,
  {
    loading: boolean;
    mutate: KeyedMutator<{
      paslon: IPaslon[] | null;
    }>;
  }
];

export function usePaslon(swrConfig?: SWRConfiguration): usePaslonType {
  const { data, mutate } = useSWR("/api/admin/paslon", swrConfig);

  const loading = !data;
  const paslon = data?.paslon;
  return [paslon, { mutate, loading }];
}
