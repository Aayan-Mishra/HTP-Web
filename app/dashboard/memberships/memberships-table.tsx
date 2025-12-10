"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus, Minus, Loader2, User, Edit, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Membership {
  id: string;
  membership_code: string;
  customer_id: string;
  tier_id: string;
  points_balance: number;
  status: string;
  created_at: string;
  customer_profiles: {
    full_name: string;
    email: string;
  };
  membership_tiers: {
    name: string;
    tier_level: number;
    benefits: any;
  };
}

interface MembershipsTableProps {
  memberships: Membership[];
}

export default function MembershipsTable({ memberships }: MembershipsTableProps) {
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [transactionType, setTransactionType] = useState<"EARNED" | "REDEEMED">("EARNED");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editStatus, setEditStatus] = useState("");

  const { toast } = useToast();
  const supabase = createClient();

  const getTierBadgeColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 1:
        return "bg-orange-100 text-orange-800 border-orange-300";
      case 2:
        return "bg-gray-300 text-gray-800 border-gray-400";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case 4:
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAdjustPoints = (membership: Membership, type: "EARNED" | "REDEEMED") => {
    setSelectedMembership(membership);
    setTransactionType(type);
    setPoints("");
    setDescription("");
    setPointsDialogOpen(true);
  };

  const handleEditMembership = (membership: Membership) => {
    setSelectedMembership(membership);
    setEditStatus(membership.status);
    setEditDialogOpen(true);
  };

  const handleDeleteMembership = (membership: Membership) => {
    setSelectedMembership(membership);
    setDeleteDialogOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedMembership) return;

    setIsSubmitting(true);

    try {
      const updateData: any = { status: editStatus };

      const { error } = await (supabase as any)
        .from("customer_memberships")
        .update(updateData)
        .eq("id", selectedMembership.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Membership updated successfully",
      });

      setEditDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!selectedMembership) return;

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from("customer_memberships")
        .delete()
        .eq("id", selectedMembership.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Membership deleted successfully",
      });

      setDeleteDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete membership",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPointsAdjustment = async () => {
    if (!selectedMembership || !points) {
      toast({
        title: "Validation Error",
        description: "Please enter points amount",
        variant: "destructive",
      });
      return;
    }

    const pointsNum = parseInt(points);
    if (transactionType === "REDEEMED" && pointsNum > selectedMembership.points_balance) {
      toast({
        title: "Insufficient Points",
        description: "Cannot redeem more points than available",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create transaction
      const { error: txError } = await supabase
        .from("membership_transactions")
        .insert([{
          membership_id: selectedMembership.id,
          transaction_type: transactionType,
          points: pointsNum,
          description: description || null,
        }] as any);

      if (txError) throw txError;

      // Update points balance
      const newBalance =
        transactionType === "EARNED"
          ? selectedMembership.points_balance + pointsNum
          : selectedMembership.points_balance - pointsNum;

      const updateData: any = { points_balance: newBalance };

      const { error: updateError } = await (supabase as any)
        .from("customer_memberships")
        .update(updateData)
        .eq("id", selectedMembership.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `${pointsNum} points ${transactionType === "EARNED" ? "added" : "redeemed"}`,
      });

      setPointsDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust points",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membership Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Purchase Current FYI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  No memberships found
                </TableCell>
              </TableRow>
            ) : (
              memberships.map((membership) => (
                <TableRow key={membership.id}>
                  <TableCell className="font-mono text-sm font-semibold text-teal-600">
                    {membership.membership_code}
                  </TableCell>
                  <TableCell className="font-medium">{membership.customer_profiles.full_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{membership.customer_profiles.email}</TableCell>
                  <TableCell>
                    <Badge className={getTierBadgeColor(membership.membership_tiers.tier_level)}>
                      {membership.membership_tiers.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold">{membership.points_balance.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={membership.status === "active" ? "default" : "secondary"}
                      className={
                        membership.status === "active"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {membership.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(membership.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAdjustPoints(membership, "EARNED")}
                        title="Add Points"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAdjustPoints(membership, "REDEEMED")}
                        title="Redeem Points"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMembership(membership)}
                        title="Edit Membership"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMembership(membership)}
                        title="Delete Membership"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionType === "EARNED" ? "Add Purchase" : "Redeem Points"}
            </DialogTitle>
            <DialogDescription>
              {selectedMembership && (
                <>
                  {selectedMembership.membership_code} - {selectedMembership.customer_profiles.full_name}
                  <br />
                  Current Balance: {selectedMembership.points_balance.toLocaleString()} points
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Purchase</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Enter Purchase amount"
                min="0"
              />
              {selectedMembership && points && (
                <p className="text-sm text-gray-500 mt-1">
                  New balance: {
                    transactionType === "EARNED"
                      ? selectedMembership.points_balance + parseInt(points || "0")
                      : selectedMembership.points_balance - parseInt(points || "0")
                  } points
                </p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Reason for adjustment..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPointsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitPointsAdjustment}
                disabled={isSubmitting || !points}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {transactionType === "EARNED" ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                    {transactionType === "EARNED" ? "Add Points" : "Redeem Points"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Membership Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Membership</DialogTitle>
            <DialogDescription>
              {selectedMembership && (
                <>
                  {selectedMembership.membership_code} - {selectedMembership.customer_profiles.full_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitEdit}
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Membership
            </DialogTitle>
            <DialogDescription>
              {selectedMembership && (
                <>
                  Are you sure you want to delete membership <strong>{selectedMembership.membership_code}</strong> for{" "}
                  <strong>{selectedMembership.customer_profiles.full_name}</strong>?
                  <br /><br />
                  This action cannot be undone and will remove all associated transaction history.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitDelete}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Membership
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
