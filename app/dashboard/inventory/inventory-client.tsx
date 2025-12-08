"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Scan, 
  AlertTriangle, 
  Clock,
  Search,
  BarChart
} from "lucide-react";
import ScanProductDialog from "./scan-product-dialog";
import AddProductDialog from "./add-product-dialog";
import ProductsTable from "./products-table";
import StockAlerts from "./stock-alerts";

interface InventoryClientProps {
  products: any[];
  lowStockProducts: any[];
  expiringProducts: any[];
}

export default function InventoryClient({ 
  products: initialProducts, 
  lowStockProducts,
  expiringProducts 
}: InventoryClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.product_code?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.manufacturer?.toLowerCase().includes(query)
    );
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.current_stock || 0), 0);
  const lowStockCount = lowStockProducts.length;
  const expiringCount = expiringProducts.length;

  const handleProductAdded = (newProduct: any) => {
    setProducts([newProduct, ...products]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventory Management
            </h1>
            <p className="text-gray-600">
              Scan, organize, and track your pharmaceutical inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowScanDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan Product
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Total Stock Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">{totalStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{lowStockCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{expiringCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="alerts">
            Stock Alerts
            {(lowStockCount + expiringCount) > 0 && (
              <Badge className="ml-2 bg-red-500">{lowStockCount + expiringCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Product Inventory</CardTitle>
                <div className="w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProductsTable products={filteredProducts} onUpdate={setProducts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlerts 
            lowStockProducts={lowStockProducts} 
            expiringProducts={expiringProducts} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ScanProductDialog 
        open={showScanDialog} 
        onClose={() => setShowScanDialog(false)}
        onProductAdded={handleProductAdded}
      />
      
      <AddProductDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}
