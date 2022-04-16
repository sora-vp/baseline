import useSWR from "swr";

type User = {
  user: UserSuccessResponse;
};

export function useUser() {
  const { data, mutate } = useSWR<User>("/api/user");

  const loading = !data;
  const user = data?.user;
  return [user, { mutate, loading }];
}
