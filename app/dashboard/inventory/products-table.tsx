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
import { Edit, Package, Plus, Minus, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  strength: string | null;
  form: string | null;
  current_stock: number;
  total_boxes: number | null;
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    strength: "",
    form: "",
    unit_price: "",
    minimum_stock: "",
    reorder_level: "",
    total_boxes: "",
  });

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

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category || "",
      manufacturer: product.manufacturer || "",
      strength: product.strength || "",
      form: product.form || "",
      unit_price: product.unit_price?.toString() || "",
      minimum_stock: product.minimum_stock.toString(),
      reorder_level: product.reorder_level.toString(),
      total_boxes: product.total_boxes?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);

    try {
      const updateData: any = {
        name: editFormData.name,
        category: editFormData.category || null,
        manufacturer: editFormData.manufacturer || null,
        strength: editFormData.strength || null,
        form: editFormData.form || null,
        unit_price: editFormData.unit_price ? parseFloat(editFormData.unit_price) : null,
        minimum_stock: parseInt(editFormData.minimum_stock) || 10,
        reorder_level: parseInt(editFormData.reorder_level) || 20,
        total_boxes: editFormData.total_boxes ? parseInt(editFormData.total_boxes) : null,
      };

      const { error } = await (supabase as any)
        .from("products")
        .update(updateData)
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setEditDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setDeleteDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

      const updateData: any = { current_stock: Math.max(0, newStock) };
      
      const { error: updateError } = await (supabase as any)
        .from("products")
        .update(updateData)
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
              <TableHead className="text-right">Quantity (Units)</TableHead>
              <TableHead className="text-right">Total Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
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
                      {product.current_stock} units
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.total_boxes !== undefined && product.total_boxes !== null 
                        ? `${product.total_boxes} boxes`
                        : '-'}
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
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                placeholder="e.g., Antibiotic, Pain Relief"
              />
            </div>

            <div>
              <Label>Manufacturer</Label>
              <Input
                value={editFormData.manufacturer}
                onChange={(e) => setEditFormData({ ...editFormData, manufacturer: e.target.value })}
                placeholder="Manufacturer name"
              />
            </div>

            <div>
              <Label>Strength</Label>
              <Input
                value={editFormData.strength}
                onChange={(e) => setEditFormData({ ...editFormData, strength: e.target.value })}
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            <div>
              <Label>Form</Label>
              <Select
                value={editFormData.form}
                onValueChange={(value) => setEditFormData({ ...editFormData, form: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="capsule">Capsule</SelectItem>
                  <SelectItem value="syrup">Syrup</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="cream">Cream</SelectItem>
                  <SelectItem value="ointment">Ointment</SelectItem>
                  <SelectItem value="drops">Drops</SelectItem>
                  <SelectItem value="inhaler">Inhaler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unit Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editFormData.unit_price}
                onChange={(e) => setEditFormData({ ...editFormData, unit_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Total Boxes/Stock</Label>
              <Input
                type="number"
                value={editFormData.total_boxes}
                onChange={(e) => setEditFormData({ ...editFormData, total_boxes: e.target.value })}
                placeholder="Number of boxes"
              />
            </div>

            <div>
              <Label>Minimum Stock</Label>
              <Input
                type="number"
                value={editFormData.minimum_stock}
                onChange={(e) => setEditFormData({ ...editFormData, minimum_stock: e.target.value })}
                placeholder="Min stock level"
              />
            </div>

            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                value={editFormData.reorder_level}
                onChange={(e) => setEditFormData({ ...editFormData, reorder_level: e.target.value })}
                placeholder="Reorder threshold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitEdit}
              disabled={isSubmitting || !editFormData.name}
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">Code: {selectedProduct.product_code}</p>
              {selectedProduct.current_stock > 0 && (
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ Current stock: {selectedProduct.current_stock} units
                </p>
              )}
            </div>
          )}

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
                "Delete Product"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
