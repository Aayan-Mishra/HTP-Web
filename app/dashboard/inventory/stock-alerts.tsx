"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, PackageX, Calendar } from "lucide-react";

interface StockAlert {
  id: string;
  product_code: string;
  name: string;
  category: string | null;
  current_stock: number;
  minimum_stock: number;
  reorder_level: number;
}

interface ExpiringProduct {
  product_id: string;
  product_code: string;
  product_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
}

interface StockAlertsProps {
  lowStockProducts: StockAlert[];
  expiringProducts: ExpiringProduct[];
}

export default function StockAlerts({ lowStockProducts, expiringProducts }: StockAlertsProps) {
  const getSeverity = (product: StockAlert) => {
    if (product.current_stock === 0) return "critical";
    if (product.current_stock < product.minimum_stock) return "high";
    return "medium";
  };

  const getExpirySeverity = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 30) return "critical";
    if (daysUntilExpiry <= 60) return "high";
    return "medium";
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PackageX className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          <Badge variant="secondary">{lowStockProducts.length}</Badge>
        </div>

        {lowStockProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <PackageX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No low stock alerts</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {lowStockProducts.map((product) => {
              const severity = getSeverity(product);
              return (
                <Card
                  key={product.id}
                  className={`p-4 border-l-4 ${
                    severity === "critical"
                      ? "border-l-red-500 bg-red-50"
                      : severity === "high"
                      ? "border-l-orange-500 bg-orange-50"
                      : "border-l-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            severity === "critical"
                              ? "text-red-600"
                              : severity === "high"
                              ? "text-orange-600"
                              : "text-yellow-600"
                          }`}
                        />
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        <span className="text-sm text-gray-500 font-mono">
                          ({product.product_code})
                        </span>
                      </div>
                      {product.category && (
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`font-semibold ${
                            severity === "critical"
                              ? "text-red-700"
                              : severity === "high"
                              ? "text-orange-700"
                              : "text-yellow-700"
                          }`}
                        >
                          Current: {product.current_stock} units
                        </span>
                        <span className="text-gray-600">
                          Min: {product.minimum_stock} | Reorder: {product.reorder_level}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        severity === "critical"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : severity === "high"
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }
                    >
                      {product.current_stock === 0 ? "OUT OF STOCK" : "LOW STOCK"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Expiring Products */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Expiring Products</h3>
          <Badge variant="secondary">{expiringProducts.length}</Badge>
        </div>

        {expiringProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No products expiring soon</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {expiringProducts.map((product) => {
              const severity = getExpirySeverity(product.days_until_expiry);
              return (
                <Card
                  key={`${product.product_id}-${product.batch_number}`}
                  className={`p-4 border-l-4 ${
                    severity === "critical"
                      ? "border-l-red-500 bg-red-50"
                      : severity === "high"
                      ? "border-l-orange-500 bg-orange-50"
                      : "border-l-purple-500 bg-purple-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar
                          className={`h-4 w-4 ${
                            severity === "critical"
                              ? "text-red-600"
                              : severity === "high"
                              ? "text-orange-600"
                              : "text-purple-600"
                          }`}
                        />
                        <span className="font-semibold text-gray-900">{product.product_name}</span>
                        <span className="text-sm text-gray-500 font-mono">
                          ({product.product_code})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <span className="text-gray-600">Batch: {product.batch_number}</span>
                        <span className="text-gray-600">Quantity: {product.quantity} units</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`font-semibold ${
                            severity === "critical"
                              ? "text-red-700"
                              : severity === "high"
                              ? "text-orange-700"
                              : "text-purple-700"
                          }`}
                        >
                          Expires: {new Date(product.expiry_date).toLocaleDateString()}
                        </span>
                        <span className="text-gray-600">
                          ({product.days_until_expiry} days remaining)
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        severity === "critical"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : severity === "high"
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-purple-100 text-purple-800 border-purple-300"
                      }
                    >
                      {product.days_until_expiry <= 30 ? "URGENT" : "EXPIRING SOON"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
