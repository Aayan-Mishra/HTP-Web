"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImportCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CsvProduct {
  name: string;
  category?: string;
  manufacturer?: string;
  strength?: string;
  form?: string;
  current_stock: number;
  total_boxes?: number;
  unit_price?: number;
  minimum_stock?: number;
  reorder_level?: number;
}

export function ImportCsvDialog({ open, onOpenChange, onSuccess }: ImportCsvDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CsvProduct[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    // Parse CSV for preview
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({
        title: "Invalid CSV",
        description: "CSV file must contain headers and at least one data row",
        variant: "destructive",
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required columns
    if (!headers.includes('name') || !headers.includes('current_stock')) {
      toast({
        title: "Invalid CSV Format",
        description: "CSV must contain 'name' and 'current_stock' columns",
        variant: "destructive",
      });
      return;
    }

    const previewData: CsvProduct[] = [];
    
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      previewData.push({
        name: row.name || '',
        category: row.category || undefined,
        manufacturer: row.manufacturer || undefined,
        strength: row.strength || undefined,
        form: row.form || undefined,
        current_stock: parseInt(row.current_stock) || 0,
        total_boxes: row.total_boxes ? parseInt(row.total_boxes) : undefined,
        unit_price: row.unit_price ? parseFloat(row.unit_price) : undefined,
        minimum_stock: row.minimum_stock ? parseInt(row.minimum_stock) : undefined,
        reorder_level: row.reorder_level ? parseInt(row.reorder_level) : undefined,
      });
    }

    setPreview(previewData);
  };

  const generateProductCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `PROD-${timestamp}-${random}`.toUpperCase();
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      let successCount = 0;
      let failedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Validate required fields
          if (!row.name || !row.current_stock) {
            failedCount++;
            continue;
          }

          const productData: any = {
            product_code: generateProductCode(),
            name: row.name,
            category: row.category || null,
            manufacturer: row.manufacturer || null,
            strength: row.strength || null,
            form: row.form || null,
            current_stock: parseInt(row.current_stock) || 0,
            total_boxes: row.total_boxes ? parseInt(row.total_boxes) : null,
            unit_price: row.unit_price ? parseFloat(row.unit_price) : null,
            minimum_stock: row.minimum_stock ? parseInt(row.minimum_stock) : null,
            reorder_level: row.reorder_level ? parseInt(row.reorder_level) : null,
          };

          const { error } = await (supabase as any)
            .from("products")
            .insert([productData]);

          if (error) {
            console.error(`Failed to import row ${i}:`, error);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing row ${i}:`, error);
          failedCount++;
        }
      }

      setImportResults({ success: successCount, failed: failedCount });

      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} product(s). ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
        });
        onSuccess();
      } else {
        toast({
          title: "Import Failed",
          description: "No products were imported. Please check your CSV format.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message || "Failed to import CSV",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setImportResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import products. Required columns: name, current_stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!importResults ? (
            <>
              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                <p className="text-sm text-gray-500 mt-2">
                  CSV format: name, category, manufacturer, strength, form, current_stock, total_boxes, unit_price, minimum_stock, reorder_level
                </p>
              </div>

              {preview.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Preview (first 5 rows)</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Manufacturer</th>
                          <th className="px-3 py-2 text-right">Stock</th>
                          <th className="px-3 py-2 text-right">Boxes</th>
                          <th className="px-3 py-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">{item.category || '-'}</td>
                            <td className="px-3 py-2">{item.manufacturer || '-'}</td>
                            <td className="px-3 py-2 text-right">{item.current_stock}</td>
                            <td className="px-3 py-2 text-right">{item.total_boxes || '-'}</td>
                            <td className="px-3 py-2 text-right">
                              {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Products
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  {importResults.success > 0 ? (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
                  <p className="text-gray-600">
                    Successfully imported: <span className="font-semibold text-green-600">{importResults.success}</span>
                  </p>
                  {importResults.failed > 0 && (
                    <p className="text-gray-600">
                      Failed: <span className="font-semibold text-red-600">{importResults.failed}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClose} className="bg-teal-600 hover:bg-teal-700">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
