import { format } from "date-fns";
import { useAdminTransactions } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";

export default function AdminTransactionsPage() {
  const { data: transactions, isLoading } = useAdminTransactions();

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdraw': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'transfer': return <Send className="w-4 h-4 text-primary" />;
      default: return null;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'deposit': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-transparent';
      case 'withdraw': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-transparent';
      case 'transfer': return 'bg-primary/10 text-primary hover:bg-primary/20 border-transparent';
      default: return '';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Transactions</h1>
          <p className="text-muted-foreground mt-1">Monitor all platform transfers and movements</p>
        </div>

        <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>Tx ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {isLoading ? (
                  Array(7).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="w-8 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="w-48 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-6 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="w-20 h-4 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No transactions recorded on platform.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx: any) => (
                    <TableRow key={tx.id} className="hover:bg-secondary/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{tx.id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase tracking-wider text-[10px] flex w-fit items-center gap-1 ${getBadgeColor(tx.type)}`}>
                          {getIcon(tx.type)}
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {tx.type === 'deposit' && `Account: ${tx.receiverAccount?.accountNumber}`}
                        {tx.type === 'withdraw' && `Account: ${tx.senderAccount?.accountNumber}`}
                        {tx.type === 'transfer' && `${tx.senderAccount?.accountNumber} → ${tx.receiverAccount?.accountNumber}`}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                          ${tx.status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                            tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 
                            'bg-red-500/10 text-red-600'}`}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
