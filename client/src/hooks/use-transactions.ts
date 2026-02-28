import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useMyTransactions() {
  return useQuery({
    queryKey: [api.transactions.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.listMy.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useTransfer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.transactions.transfer.input>) => {
      const res = await fetch(api.transactions.transfer.path, {
        method: api.transactions.transfer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Transfer failed");
      }
      return api.transactions.transfer.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.listMy.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.myAccount.path] });
      toast({ title: "Transfer Successful", description: "Funds have been sent securely." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Transfer Failed", description: error.message });
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.transactions.deposit.input>) => {
      const res = await fetch(api.transactions.deposit.path, {
        method: api.transactions.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Deposit failed");
      }
      return api.transactions.deposit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.listMy.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.myAccount.path] });
      toast({ title: "Deposit Successful", description: "Funds have been added to your account." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Deposit Failed", description: error.message });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.transactions.withdraw.input>) => {
      const res = await fetch(api.transactions.withdraw.path, {
        method: api.transactions.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Withdrawal failed");
      }
      return api.transactions.withdraw.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.listMy.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.myAccount.path] });
      toast({ title: "Withdrawal Successful", description: "Funds have been deducted from your account." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Withdrawal Failed", description: error.message });
    },
  });
}
