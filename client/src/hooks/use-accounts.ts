import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMyAccount() {
  return useQuery({
    queryKey: [api.accounts.myAccount.path],
    queryFn: async () => {
      const res = await fetch(api.accounts.myAccount.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch account details");
      return api.accounts.myAccount.responses[200].parse(await res.json());
    },
  });
}
