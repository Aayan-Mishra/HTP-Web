"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CustomerProfile {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface AddDoctorDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddDoctorDialog({ open, onClose, onAdded }: AddDoctorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [formData, setFormData] = useState({
    specialization: "",
    license_number: "",
    qualification: "",
    years_of_experience: "",
    clinic_address: "",
    consultation_fee: "",
    consultation_hours: "",
    available_days: [] as string[],
  });

  const { toast } = useToast();
  const supabase = createClient();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  const loadCustomers = async () => {
    const { data: existingDoctors } = await supabase
      .from("doctors")
      .select("clerk_user_id");

    const doctorClerkIds = existingDoctors?.map(d => d.clerk_user_id) || [];

    const { data, error } = await supabase
      .from("customer_profiles")
      .select("id, clerk_user_id, full_name, email, phone")
      .order("full_name");

    if (!error && data) {
      const availableCustomers = data.filter(c => !doctorClerkIds.includes(c.clerk_user_id));
      setCustomers(availableCustomers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast({
        title: "Validation Error",
        description: "Please select a customer profile",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer) throw new Error("Customer not found");

      const { error } = await supabase
        .from("doctors")
        .insert([{
          clerk_user_id: customer.clerk_user_id,
          email: customer.email,
          full_name: customer.full_name,
          phone: customer.phone || null,
          specialization: formData.specialization || null,
          license_number: formData.license_number || null,
          qualification: formData.qualification || null,
          years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
          clinic_address: formData.clinic_address || null,
          consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
          consultation_hours: formData.consultation_hours || null,
          available_days: formData.available_days.length > 0 ? formData.available_days : null,
          status: "active",
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${customer.full_name} is now registered as a doctor`,
      });

      setSelectedCustomer("");
      setFormData({
        specialization: "",
        license_number: "",
        qualification: "",
        years_of_experience: "",
        clinic_address: "",
        consultation_fee: "",
        consultation_hours: "",
        available_days: [],
      });

      onAdded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add doctor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Doctor</DialogTitle>
          <DialogDescription>
            Select a customer profile and add their professional details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Profile *</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer to make doctor" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., General Practitioner"
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="Medical license number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="qualification">Qualification</Label>
            <Textarea
              id="qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g., MBBS, MD, etc."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                placeholder="Years"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
              <Input
                id="consultation_fee"
                type="number"
                step="0.01"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clinic_address">Clinic Address</Label>
            <Textarea
              id="clinic_address"
              value={formData.clinic_address}
              onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
              placeholder="Full clinic address"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="consultation_hours">Consultation Hours</Label>
            <Input
              id="consultation_hours"
              value={formData.consultation_hours}
              onChange={(e) => setFormData({ ...formData, consultation_hours: e.target.value })}
              placeholder="e.g., 9:00 AM - 5:00 PM"
            />
          </div>

          <div>
            <Label>Available Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={formData.available_days.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day)}
                  className={formData.available_days.includes(day) ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {day.substring(0, 3)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Register Doctor
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
