import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { useMyTransactions } from "@/hooks/use-transactions";
import { useMyAccount } from "@/hooks/use-accounts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsPage() {
  const { data: transactions, isLoading: loadingTx } = useMyTransactions();
  const { data: account } = useMyAccount();

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground mt-1">View all your past account activities</p>
          </div>
        </div>

        <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[200px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {loadingTx ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-48 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-6 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="w-20 h-4 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx: any) => {
                    const isDeposit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiverId === account?.id);

                    return (
                      <TableRow key={tx.id} className="hover:bg-secondary/20">
                        <TableCell className="font-medium text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                          <div className="text-xs">{format(new Date(tx.createdAt), 'hh:mm a')}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isDeposit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <span className="font-semibold capitalize">
                              {tx.type === 'transfer'
                                ? (isDeposit ? `Transfer from ${tx.senderAccount?.accountNumber}` : `Transfer to ${tx.receiverAccount?.accountNumber}`)
                                : tx.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider
                            ${tx.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                              tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                'bg-red-500/10 text-red-600'}`}>
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-bold text-base ${isDeposit ? 'text-green-500' : 'text-foreground'}`}>
                          {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
