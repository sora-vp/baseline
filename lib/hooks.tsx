import useSWR from "swr";

export function useUser() {
  const { data, mutate } = useSWR("/api/user");

  const loading = !data;
  const user = data?.user;
  return [user, { mutate, loading }];
}
