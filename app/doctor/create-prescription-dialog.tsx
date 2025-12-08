"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  allergies: string | null;
  chronic_conditions: string | null;
  current_medications: string | null;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface CreatePrescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  doctorId: string;
}

export default function CreatePrescriptionDialog({
  open,
  onClose,
  patient,
  doctorId,
}: CreatePrescriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    symptoms: "",
    notes: "",
    follow_up_date: "",
  });
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  const { toast } = useToast();
  const supabase = createClient();

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.diagnosis || medications.some(m => !m.name)) {
      toast({
        title: "Validation Error",
        description: "Please provide diagnosis and at least one medication",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("prescriptions")
        .insert([{
          patient_id: patient.id,
          doctor_id: doctorId,
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms || null,
          notes: formData.notes || null,
          medications: medications.filter(m => m.name),
          follow_up_date: formData.follow_up_date || null,
          status: "pending",
        }] as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      onClose();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
          <DialogDescription>
            Patient: {patient.full_name} ({patient.patient_code})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Medical Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Patient Medical Information</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Allergies:</span>
                <p className="font-medium">{patient.allergies || "None"}</p>
              </div>
              <div>
                <span className="text-gray-600">Chronic Conditions:</span>
                <p className="font-medium">{patient.chronic_conditions || "None"}</p>
              </div>
              <div>
                <span className="text-gray-600">Current Medications:</span>
                <p className="font-medium">{patient.current_medications || "None"}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Primary diagnosis"
              required
            />
          </div>

          {/* Symptoms */}
          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Patient's symptoms..."
              rows={2}
            />
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Medications *</Label>
              <Button type="button" size="sm" onClick={addMedication} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>

            {medications.map((med, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medication {index + 1}</span>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Medicine Name *</Label>
                    <Input
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      placeholder="e.g., Paracetamol"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dosage</Label>
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Frequency</Label>
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      placeholder="e.g., 3 times daily"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Input
                      value={med.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      placeholder="e.g., 5 days"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Instructions</Label>
                    <Input
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      placeholder="e.g., After meals"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes for the patient or pharmacist..."
              rows={3}
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
