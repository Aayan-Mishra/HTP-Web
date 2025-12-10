"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImportCSVDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  tiers: any[];
}

export default function ImportCSVDialog({ open, onClose, onImported }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

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
    setResults(null);

    // Parse and preview first 5 rows
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const previewData = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    setPreview(previewData);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Validate headers
      const requiredHeaders = ['customer_id', 'tier_id', 'points_balance', 'status'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        try {
          // Generate membership code
          const membershipCode = `MEM-${Date.now()}-${i}`;

          const { error } = await (supabase as any)
            .from("customer_memberships")
            .insert([{
              customer_id: row.customer_id,
              tier_id: row.tier_id,
              membership_code: membershipCode,
              points_balance: parseInt(row.points_balance) || 0,
              status: row.status || 'active',
            }]);

          if (error) {
            failedCount++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          failedCount++;
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }

      setResults({ success: successCount, failed: failedCount, errors });

      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} membership${successCount > 1 ? 's' : ''}`,
        });
        onImported();
      }

      if (failedCount > 0) {
        toast({
          title: "Import Completed with Errors",
          description: `${failedCount} row${failedCount > 1 ? 's' : ''} failed to import`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Memberships from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with membership data. Required columns: customer_id, tier_id, points_balance, status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium mb-1">
                {file ? file.name : "Click to upload CSV file"}
              </p>
              <p className="text-xs text-gray-500">
                CSV files only
              </p>
            </label>
          </div>

          {/* CSV Format Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-900">CSV Format Example:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              customer_id,tier_id,points_balance,status{'\n'}
              uuid-1234,tier-uuid-1,1000,active{'\n'}
              uuid-5678,tier-uuid-2,500,active
            </pre>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Preview (first 5 rows):</h4>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="px-3 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">{results.success} successfully imported</span>
              </div>
              {results.failed > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">{results.failed} failed</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold mb-2">Errors:</p>
                    {results.errors.map((error, i) => (
                      <p key={i} className="text-xs text-red-800 mb-1">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {results ? "Close" : "Cancel"}
            </Button>
            {!results && (
              <Button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Memberships
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
