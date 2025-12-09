"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, Receipt, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  membership_id: string;
  transaction_type: string;
  points: number;
  description: string | null;
  order_id: string | null;
  created_at: string;
  customer_memberships: {
    membership_code: string;
    customer_profiles: {
      full_name: string;
    };
  };
}

interface TransactionsTableProps {
  transactions: Transaction[];
  memberships: any[];
}

export default function TransactionsTable({ transactions, memberships }: TransactionsTableProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    membership_id: "",
    transaction_type: "EARNED",
    points: "",
    description: "",
  });

  const { toast } = useToast();
  const supabase = createClient();

  const handleAddTransaction = async () => {
    if (!formData.membership_id || !formData.points) {
      toast({
        title: "Validation Error",
        description: "Please select membership and enter points",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const membership = memberships.find(m => m.id === formData.membership_id);
      const pointsNum = parseInt(formData.points);

      // Create transaction
      const { error: txError } = await supabase
        .from("membership_transactions")
        .insert([{
          membership_id: formData.membership_id,
          transaction_type: formData.transaction_type,
          points: pointsNum,
          description: formData.description || null,
        }] as any);

      if (txError) throw txError;

      // Update membership points
      const newBalance =
        formData.transaction_type === "EARNED"
          ? membership.points_balance + pointsNum
          : membership.points_balance - pointsNum;

      const updateData: any = { points_balance: newBalance };

      const { error: updateError } = await supabase
        .from("customer_memberships")
        .update(updateData)
        .eq("id", formData.membership_id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Transaction added successfully`,
      });

      setAddDialogOpen(false);
      setFormData({
        membership_id: "",
        transaction_type: "EARNED",
        points: "",
        description: "",
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Manual Transaction
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {tx.customer_memberships.membership_code}
                    </TableCell>
                    <TableCell>{tx.customer_memberships.customer_profiles.full_name}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tx.transaction_type === "EARNED"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : tx.transaction_type === "REDEEMED"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-purple-100 text-purple-800 border-purple-300"
                        }
                      >
                        {tx.transaction_type === "EARNED" && <ArrowUp className="h-3 w-3 mr-1" />}
                        {tx.transaction_type === "REDEEMED" && <ArrowDown className="h-3 w-3 mr-1" />}
                        {tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          tx.transaction_type === "EARNED" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.transaction_type === "EARNED" ? "+" : "-"}
                        {tx.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {tx.description || "-"}
                      {tx.order_id && (
                        <span className="ml-2 text-xs text-gray-400">Order: {tx.order_id}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Manual Transaction Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Manual Transaction</DialogTitle>
            <DialogDescription>
              Manually add or deduct points from a membership
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Membership</Label>
              <Select
                value={formData.membership_id}
                onValueChange={(value) => setFormData({ ...formData, membership_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership" />
                </SelectTrigger>
                <SelectContent>
                  {memberships.filter(m => m.status === "active").map((membership) => (
                    <SelectItem key={membership.id} value={membership.id}>
                      {membership.membership_code} - {membership.customer_profiles.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNED">Earned (Add Points)</SelectItem>
                  <SelectItem value="REDEEMED">Redeemed (Deduct Points)</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="Enter points amount"
                min="0"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Reason for transaction..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTransaction}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

