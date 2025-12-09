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
import { Edit, Package, Plus, Minus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  strength: string | null;
  form: string | null;
  current_stock: number;
  minimum_stock: number;
  reorder_level: number;
  unit_price: number | null;
}

interface ProductsTableProps {
  products: Product[];
  onUpdate: () => void;
}

export default function ProductsTable({ products, onUpdate }: ProductsTableProps) {
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const supabase = createClient();

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return { label: "OUT OF STOCK", variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-300" };
    } else if (product.current_stock < product.minimum_stock) {
      return { label: "CRITICAL", variant: "destructive" as const, className: "bg-orange-100 text-orange-800 border-orange-300" };
    } else if (product.current_stock < product.reorder_level) {
      return { label: "LOW STOCK", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    } else {
      return { label: "OK", variant: "default" as const, className: "bg-green-100 text-green-800 border-green-300" };
    }
  };

  const handleAdjustStock = (product: Product, type: "IN" | "OUT" | "ADJUSTMENT") => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity("");
    setNotes("");
    setAdjustDialogOpen(true);
  };

  const submitStockAdjustment = async () => {
    if (!selectedProduct || !quantity) {
      toast({
        title: "Validation Error",
        description: "Please enter a quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quantityNum = parseInt(quantity);
      
      // Create stock movement
      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert([{
          product_id: selectedProduct.id,
          movement_type: adjustmentType,
          quantity: quantityNum,
          notes: notes || null,
        }] as any);

      if (movementError) throw movementError;

      // Update product stock
      let newStock = selectedProduct.current_stock;
      if (adjustmentType === "IN") {
        newStock += quantityNum;
      } else if (adjustmentType === "OUT") {
        newStock -= quantityNum;
      } else {
        newStock = quantityNum; // ADJUSTMENT sets to exact value
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ current_stock: Math.max(0, newStock) } as any)
        .eq("id", selectedProduct.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Stock ${adjustmentType === "IN" ? "added" : adjustmentType === "OUT" ? "removed" : "adjusted"} successfully`,
      });

      setAdjustDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust stock",
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
              <TableHead>Product Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Form</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.strength && (
                        <span className="text-sm text-gray-500 ml-1">({product.strength})</span>
                      )}
                    </TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>{product.manufacturer || "-"}</TableCell>
                    <TableCell className="capitalize">{product.form || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.current_stock}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.unit_price ? `$${product.unit_price.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAdjustStock(product, "IN")}
                          title="Add Stock"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAdjustStock(product, "OUT")}
                          title="Remove Stock"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAdjustStock(product, "ADJUSTMENT")}
                          title="Adjust Stock"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "IN" ? "Add Stock" : adjustmentType === "OUT" ? "Remove Stock" : "Adjust Stock"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  {selectedProduct.name} ({selectedProduct.product_code})
                  <br />
                  Current Stock: {selectedProduct.current_stock} units
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>
                {adjustmentType === "ADJUSTMENT" ? "New Stock Quantity" : "Quantity"}
              </Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={adjustmentType === "ADJUSTMENT" ? "Enter new total" : "Enter quantity"}
                min="0"
              />
              {adjustmentType !== "ADJUSTMENT" && selectedProduct && quantity && (
                <p className="text-sm text-gray-500 mt-1">
                  New stock: {
                    adjustmentType === "IN"
                      ? selectedProduct.current_stock + parseInt(quantity || "0")
                      : Math.max(0, selectedProduct.current_stock - parseInt(quantity || "0"))
                  } units
                </p>
              )}
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for adjustment..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitStockAdjustment}
                disabled={isSubmitting || !quantity}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
