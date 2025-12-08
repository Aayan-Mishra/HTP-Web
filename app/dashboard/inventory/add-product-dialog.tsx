"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export default function AddProductDialog({ open, onClose, onProductAdded }: AddProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    manufacturer: "",
    dosage: "",
    strength: "",
    form: "",
    unit_price: "",
    current_stock: "",
    minimum_stock: "10",
    reorder_level: "20",
  });

  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          manufacturer: formData.manufacturer || null,
          dosage: formData.dosage || null,
          strength: formData.strength || null,
          form: formData.form || null,
          unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          current_stock: parseInt(formData.current_stock) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 10,
          reorder_level: parseInt(formData.reorder_level) || 20,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product "${formData.name}" added successfully with code ${data.product_code}`,
      });

      onProductAdded(data);
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      manufacturer: "",
      dosage: "",
      strength: "",
      form: "",
      unit_price: "",
      current_stock: "",
      minimum_stock: "10",
      reorder_level: "20",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-600" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Manually enter product details to add to inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Paracetamol Tablets"
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Pain Relief, Antibiotics"
              />
            </div>

            <div>
              <Label>Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., Pfizer, GSK"
              />
            </div>

            <div>
              <Label>Form</Label>
              <Input
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                placeholder="e.g., Tablet, Capsule, Syrup"
              />
            </div>

            <div>
              <Label>Strength/Dosage</Label>
              <Input
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            <div>
              <Label>Unit Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Current Stock</Label>
              <Input
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Minimum Stock Level</Label>
              <Input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="10"
              />
            </div>

            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                placeholder="20"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional notes or description..."
              />
            </div>
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
