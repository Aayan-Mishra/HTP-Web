"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateMembershipDialogProps {
  open: boolean;
  onClose: () => void;
  onMembershipCreated: () => void;
  tiers: any[];
}

export default function CreateMembershipDialog({ open, onClose, onMembershipCreated, tiers }: CreateMembershipDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [membershipCode, setMembershipCode] = useState("");
  const [formData, setFormData] = useState({
    customer_id: "",
    tier_id: "",
    initial_points: "0",
  });

  const { toast } = useToast();
  const supabase = createClient();

  // Generate membership code on mount and when dialog opens
  useEffect(() => {
    if (open) {
      generateMembershipCode();
      loadCustomers();
    }
  }, [open]);

  const generateMembershipCode = () => {
    // Generate 6 random digits
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const code = `HTP-${randomDigits}`;
    setMembershipCode(code);
  };

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customer_profiles")
      .select("id, full_name, email")
      .order("full_name");
    
    if (data) {
      setCustomers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.tier_id) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and tier",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if customer already has a membership
      const { data: existing } = await supabase
        .from("customer_memberships")
        .select("id")
        .eq("customer_id", formData.customer_id)
        .single();

      if (existing) {
        toast({
          title: "Error",
          description: "This customer already has a membership",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create membership
      const { data: membership, error } = await supabase
        .from("customer_memberships")
        .insert([{
          customer_id: formData.customer_id,
          tier_id: formData.tier_id,
          membership_code: membershipCode,
          points_balance: parseInt(formData.initial_points) || 0,
          status: "active",
        }] as any)
        .select()
        .single();

      if (error) throw error;

      // Create initial transaction if points were added
      if (parseInt(formData.initial_points) > 0) {
        await supabase
          .from("membership_transactions")
          .insert([{
            membership_id: (membership as any)?.id,
            transaction_type: "EARNED",
            points: parseInt(formData.initial_points),
            description: "Initial points",
          }] as any);
      }

      toast({
        title: "Success",
        description: `Membership ${membershipCode} created successfully`,
      });

      onMembershipCreated();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create membership",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customer_id: "",
      tier_id: "",
      initial_points: "0",
    });
    generateMembershipCode();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Create New Membership
          </DialogTitle>
          <DialogDescription>
            Create a loyalty membership for a customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-generated Membership Code */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <Label className="text-sm text-gray-600">Membership Code</Label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-teal-900 font-mono">{membershipCode}</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={generateMembershipCode}
                title="Generate new code"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-generated unique code</p>
          </div>

          {/* Customer Selection */}
          <div>
            <Label>Customer *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tier Selection */}
          <div>
            <Label>Membership Tier *</Label>
            <Select
              value={formData.tier_id}
              onValueChange={(value) => setFormData({ ...formData, tier_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name} - {tier.discount_percentage}% off, {tier.points_multiplier}x points
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Points */}
          <div>
            <Label>Initial Points (Optional)</Label>
            <Input
              type="number"
              value={formData.initial_points}
              onChange={(e) => setFormData({ ...formData, initial_points: e.target.value })}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Welcome bonus or transferred points</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Membership
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
