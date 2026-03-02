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

export function useAccountLookup(accountNumber: string) {
  return useQuery({
    queryKey: [api.accounts.lookup.path, accountNumber],
    queryFn: async () => {
      if (!accountNumber || accountNumber.length < 5) return null;
      const url = new URL(api.accounts.lookup.path, window.location.origin);
      url.searchParams.append("accountNumber", accountNumber);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch lookup details");
      return api.accounts.lookup.responses[200].parse(await res.json());
    },
    enabled: !!accountNumber && accountNumber.length >= 5,
  });
}
