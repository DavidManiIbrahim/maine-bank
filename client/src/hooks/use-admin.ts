import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.responses[200].parse(await res.json());
    },
  });
}

export function useAdminToggleFreeze() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isFrozen }: { id: number; isFrozen: boolean }) => {
      const url = buildUrl(api.admin.toggleFreeze.path, { id });
      const res = await fetch(url, {
        method: api.admin.toggleFreeze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFrozen }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user status");
      return api.admin.toggleFreeze.responses[200].parse(await res.json());
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      toast({ 
        title: "Status Updated", 
        description: `User account has been ${updatedUser.isFrozen ? 'frozen' : 'unfrozen'}.` 
      });
    },
  });
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: [api.admin.transactions.path],
    queryFn: async () => {
      const res = await fetch(api.admin.transactions.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch all transactions");
      return api.admin.transactions.responses[200].parse(await res.json());
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch system stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}
