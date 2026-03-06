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
import { ArrowUpRight, ArrowDownLeft, Send, UserRound, AlertCircle, CreditCard } from "lucide-react";
import { useDeposit, useWithdraw, useTransfer, useInitializeFlutterwave } from "@/hooks/use-transactions";
import { useAccountLookup } from "@/hooks/use-accounts";
import { Skeleton } from "@/components/ui/skeleton";

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
  const initializeFlutterwave = useInitializeFlutterwave();

  const isTransfer = action === "transfer";
  const schema = isTransfer ? transferSchema : basicSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      ...(isTransfer ? { receiverAccountNumber: "" } : {}),
    },
  });

  const accountNumberValue = form.watch("receiverAccountNumber" as any);
  const { data: recipientInfo, isLoading: isLookingUp, isError: lookupFailed } = useAccountLookup(accountNumberValue as string);

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (action === "deposit") {
      initializeFlutterwave.mutate({ amount: values.amount });
    } else if (action === "withdraw") {
      withdraw.mutate({ amount: values.amount }, { onSuccess: onClose });
    } else if (action === "transfer" && 'receiverAccountNumber' in values) {
      transfer.mutate({
        amount: values.amount,
        receiverAccountNumber: (values as any).receiverAccountNumber
      }, { onSuccess: onClose });
    }
  };

  const isPending = deposit.isPending || withdraw.isPending || transfer.isPending || initializeFlutterwave.isPending;

  const config = {
    deposit: { title: "Deposit Funds", icon: ArrowDownLeft, desc: "Add money securely via Flutterwave", color: "text-green-500" },
    withdraw: { title: "Withdraw Funds", icon: ArrowUpRight, desc: "Transfer money to your bank", color: "text-red-500" },
    transfer: { title: "Send Money", icon: Send, desc: "Transfer to another  MAINE BANK account", color: "text-primary" },
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
                control={form.control as any}
                name="receiverAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234567890" className="rounded-xl h-12 bg-secondary/50" {...field} />
                    </FormControl>

                    {accountNumberValue?.length >= 5 && (
                      <div className="mt-2 p-3 rounded-xl bg-secondary/30 flex items-center gap-3">
                        {isLookingUp ? (
                          <>
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-2 w-16" />
                            </div>
                          </>
                        ) : recipientInfo ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <UserRound className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold leading-none">{recipientInfo.fullName}</p>
                              <p className="text-xs text-muted-foreground mt-1">Ready to receive</p>
                            </div>
                          </>
                        ) : lookupFailed ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-500 leading-none">Account not found</p>
                              <p className="text-xs text-muted-foreground mt-1">Please check the number</p>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
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
                  <FormLabel>Amount (₦)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
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
              className="w-full h-12 rounded-xl text-md font-semibold gap-2"
              disabled={isPending}
            >
              {isPending ? "Processing..." : (
                <>
                  {action === 'deposit' && <CreditCard className="w-5 h-5" />}
                  Confirm {action}
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
