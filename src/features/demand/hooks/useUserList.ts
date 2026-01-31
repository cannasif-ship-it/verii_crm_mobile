import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api/demandApi";
import type { UserDto } from "../types";

const STALE_TIME_MS = 60 * 1000;

export function useUserList(): {
  data: UserDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery<UserDto[], Error>({
    queryKey: ["user", "list"],
    queryFn: () => demandApi.getUserList(),
    staleTime: STALE_TIME_MS,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => query.refetch(),
  };
}
