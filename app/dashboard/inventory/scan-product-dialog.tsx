"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import Tesseract from "tesseract.js";
import { createClient } from "@/lib/supabase/client";

interface ScanProductDialogProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export default function ScanProductDialog({ open, onClose, onProductAdded }: ScanProductDialogProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState(0);
  
  // Form data extracted/edited from OCR
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        processImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please upload an image instead.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;
      setOcrText(extractedText);

      // Smart extraction of product information
      const extracted = extractProductInfo(extractedText);
      setFormData(prev => ({ ...prev, ...extracted }));

      toast({
        title: "OCR Complete",
        description: "Text extracted successfully. Please review and edit the details.",
      });
    } catch (error) {
      toast({
        title: "OCR Failed",
        description: "Could not extract text from image. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const extractProductInfo = (text: string): Partial<typeof formData> => {
    const extracted: Partial<typeof formData> = {};

    // Common patterns for medicine information
    const lines = text.split("\n").filter(line => line.trim());

    // Try to extract product name (usually first significant line)
    if (lines.length > 0) {
      extracted.name = lines[0].trim();
    }

    // Extract manufacturer (look for keywords)
    const mfgLine = lines.find(line => 
      /manufactured|mfg|company|pharma|ltd/i.test(line)
    );
    if (mfgLine) {
      extracted.manufacturer = mfgLine.replace(/manufactured by|mfg|:/gi, "").trim();
    }

    // Extract dosage/strength (look for mg, ml, etc.)
    const dosageLine = lines.find(line => 
      /\d+\s*(mg|ml|g|mcg|iu)/i.test(line)
    );
    if (dosageLine) {
      const match = dosageLine.match(/(\d+\s*(mg|ml|g|mcg|iu))/i);
      if (match) {
        extracted.strength = match[0];
      }
    }

    // Extract form (tablet, capsule, syrup, etc.)
    const formLine = lines.find(line => 
      /tablet|capsule|syrup|injection|cream|ointment/i.test(line)
    );
    if (formLine) {
      const match = formLine.match(/tablet|capsule|syrup|injection|cream|ointment/i);
      if (match) {
        extracted.form = match[0].toLowerCase();
      }
    }

    // Try to categorize based on keywords
    const textLower = text.toLowerCase();
    if (textLower.includes("antibiotic") || textLower.includes("anti-bacterial")) {
      extracted.category = "Antibiotics";
    } else if (textLower.includes("pain") || textLower.includes("analgesic")) {
      extracted.category = "Pain Relief";
    } else if (textLower.includes("vitamin")) {
      extracted.category = "Vitamins";
    }

    return extracted;
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

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
          ocr_text: ocrText || null,
          scanned_image_url: image || null,
        }] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product "${formData.name}" added successfully with code ${(data as any)?.product_code}`,
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
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImage(null);
    setOcrText("");
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Scan Product with OCR
          </DialogTitle>
          <DialogDescription>
            Take a photo or upload an image to automatically extract product information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Capture Section */}
          {!image && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={isCameraActive ? capturePhoto : startCamera}
                  className="flex-1"
                  variant={isCameraActive ? "default" : "outline"}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isCameraActive ? "Capture Photo" : "Use Camera"}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {isCameraActive && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>
          )}

          {/* Image Preview & OCR Progress */}
          {image && (
            <div className="space-y-4">
              <div className="relative">
                <img src={image} alt="Product" className="w-full rounded-lg border" />
                {!isProcessing && (
                  <Button
                    onClick={() => setImage(null)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-teal-900">
                      Processing with OCR... {progress}%
                    </p>
                    <div className="mt-2 w-full bg-teal-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted OCR Text */}
              {ocrText && !isProcessing && (
                <div>
                  <Label>Extracted Text (OCR)</Label>
                  <Textarea
                    value={ocrText}
                    readOnly
                    rows={4}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Product Form */}
          {image && !isProcessing && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Pain Relief"
                />
              </div>

              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., Pfizer"
                />
              </div>

              <div>
                <Label>Form</Label>
                <Input
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  placeholder="e.g., Tablet, Capsule"
                />
              </div>

              <div>
                <Label>Strength/Dosage</Label>
                <Input
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g., 500mg"
                />
              </div>

              <div>
                <Label>Unit Price</Label>
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
                <Label>Minimum Stock</Label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
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
          )}

          {/* Actions */}
          {image && !isProcessing && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
