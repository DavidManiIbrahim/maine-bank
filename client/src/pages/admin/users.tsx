import { useState } from "react";
import { format } from "date-fns";
import { useAdminUsers, useAdminToggleFreeze } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const toggleFreeze = useAdminToggleFreeze();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View and manage customer accounts across the platform</p>
        </div>

        <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Account Access</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="w-48 h-10" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-6 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="w-12 h-6 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((u) => (
                    <TableRow key={u.id} className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{u.fullName}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? "default" : "secondary"} className="uppercase tracking-wider text-[10px]">
                          {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : null}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {u.isFrozen ? (
                          <span className="flex items-center text-xs font-bold text-red-600 bg-red-500/10 px-2 py-1 rounded-md w-fit">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            FROZEN
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
                            ACTIVE
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== 'admin' && (
                          <div className="flex justify-end items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                            </span>
                            <Switch
                              checked={u.isFrozen ?? false}
                              disabled={toggleFreeze.isPending}
                              onCheckedChange={(checked) => toggleFreeze.mutate({ id: u.id, isFrozen: checked })}
                            />
                          </div>
                        )}
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
