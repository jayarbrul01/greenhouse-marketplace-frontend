import { useGetProfileQuery } from "@/store/api/user.api";

export function useIsAdmin() {
  const { data: profile, isLoading } = useGetProfileQuery();
  const isAdmin = profile?.roles?.includes("ADMIN") ?? false;
  return { isAdmin, isLoading };
}
