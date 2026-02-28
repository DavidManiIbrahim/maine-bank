import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";
import { useDeposit, useWithdraw, useTransfer } from "@/hooks/use-transactions";

type ActionType = "deposit" | "withdraw" | "transfer";

interface TransactionDialogProps {
  action: ActionType | null;
  onClose: () => void;
}

const transferSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Invalid amount"),
  receiverAccountNumber: z.string().min(1, "Account number is required"),
});

const basicSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Invalid amount"),
});

export function TransactionDialog({ action, onClose }: TransactionDialogProps) {
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const transfer = useTransfer();

  const isTransfer = action === "transfer";
  const schema = isTransfer ? transferSchema : basicSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      ...(isTransfer ? { receiverAccountNumber: "" } : {}),
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (action === "deposit") {
      deposit.mutate({ amount: values.amount }, { onSuccess: onClose });
    } else if (action === "withdraw") {
      withdraw.mutate({ amount: values.amount }, { onSuccess: onClose });
    } else if (action === "transfer" && 'receiverAccountNumber' in values) {
      transfer.mutate({ 
        amount: values.amount, 
        receiverAccountNumber: values.receiverAccountNumber 
      }, { onSuccess: onClose });
    }
  };

  const isPending = deposit.isPending || withdraw.isPending || transfer.isPending;

  const config = {
    deposit: { title: "Deposit Funds", icon: ArrowDownLeft, desc: "Add money to your balance", color: "text-green-500" },
    withdraw: { title: "Withdraw Funds", icon: ArrowUpRight, desc: "Transfer money to your bank", color: "text-red-500" },
    transfer: { title: "Send Money", icon: Send, desc: "Transfer to another Nexus Bank account", color: "text-primary" },
  };

  const currentConfig = action ? config[action] : null;
  const Icon = currentConfig?.icon;

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {Icon && <div className={`p-3 rounded-full bg-secondary ${currentConfig.color}`}><Icon className="w-5 h-5" /></div>}
            <div>
              <DialogTitle className="text-xl">{currentConfig?.title}</DialogTitle>
              <DialogDescription>{currentConfig?.desc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {isTransfer && (
              <FormField
                control={form.control}
                name="receiverAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ACCT-12345678" className="rounded-xl h-12 bg-secondary/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className="rounded-xl h-14 pl-8 text-lg font-semibold bg-secondary/50" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-md font-semibold"
              disabled={isPending}
            >
              {isPending ? "Processing..." : `Confirm ${action}`}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
