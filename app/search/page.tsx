"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, ArrowLeft, Package, AlertTriangle } from "lucide-react";
import { searchMedicines } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type Medicine = {
  id: string;
  name: string;
  generic_name: string | null;
  category: string;
  manufacturer: string | null;
  unit_price: number;
  total_quantity: number;
  requires_prescription: boolean;
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const medicines = await searchMedicines(searchTerm);
      setResults(medicines);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Hometown Pharmacy</span>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Search Medicines</CardTitle>
            <CardDescription>
              Find medicines by name, generic name, or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter medicine name (e.g., Paracetamol, Crocin, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No medicines found
              </h3>
              <p className="text-gray-500">
                Try searching with a different name or category
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600">Found {results.length} medicine(s)</p>
            {results.map((medicine) => (
              <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{medicine.name}</CardTitle>
                      {medicine.generic_name && (
                        <CardDescription className="text-base">
                          {medicine.generic_name}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(medicine.unit_price)}
                      </div>
                      <div className="text-sm text-gray-500">per unit</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{medicine.category}</span>
                  </div>
                  {medicine.manufacturer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium">{medicine.manufacturer}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">Stock Status:</span>
                    {medicine.total_quantity > 0 ? (
                      <span className="font-medium text-green-600 flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        In Stock ({medicine.total_quantity} units)
                      </span>
                    ) : (
                      <span className="font-medium text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                  {medicine.requires_prescription && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                      <p className="text-sm text-yellow-800 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Prescription Required
                      </p>
                    </div>
                  )}
                  <Link href={`/order?medicine=${encodeURIComponent(medicine.name)}`}>
                    <Button className="w-full mt-4" disabled={medicine.total_quantity === 0}>
                      {medicine.total_quantity > 0 ? "Place Order" : "Notify When Available"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
