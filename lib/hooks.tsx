import useSWR, { KeyedMutator } from "swr";
import { DateTime } from "luxon";

type UserType = { email: string; username: string; date: DateTime };
type useUserType = [
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
