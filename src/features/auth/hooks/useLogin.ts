import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { authApi } from "../api";
import { useAuthStore } from "../../../store/auth";
import type { LoginRequest, LoginResponseData, Branch } from "../types";

interface LoginWithBranchRequest {
  loginData: LoginRequest;
  branch: Branch;
}

interface UseLoginResult {
  login: UseMutateFunction<LoginResponseData, Error, LoginWithBranchRequest>;
  loginAsync: (data: LoginWithBranchRequest) => Promise<LoginResponseData>;
  isLoading: boolean;
  error: Error | null;
}

export function useLogin(): UseLoginResult {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setBranch = useAuthStore((state) => state.setBranch);

  const mutation = useMutation({
    mutationFn: async ({ loginData }: LoginWithBranchRequest) => {
      return authApi.login(loginData);
    },
    onSuccess: async (data, { branch }) => {
      await setAuth(data.token);
      await setBranch(branch);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
