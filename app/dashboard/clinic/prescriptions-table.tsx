"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PrescriptionsTable({ prescriptions, onUpdate }: { prescriptions: any[]; onUpdate: () => void }) {
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const { toast } = useToast();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sent_to_pharmacy":
        return "bg-blue-100 text-blue-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generatePdf = async (prescription: any) => {
    setGeneratingPdf(prescription.id);

    try {
      // Create PDF content
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .clinic-name { font-size: 24px; font-weight: bold; color: #2563eb; }
    .rx-number { font-size: 14px; color: #666; margin-top: 10px; }
    .section { margin: 25px 0; }
    .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: bold; width: 150px; }
    .info-value { flex: 1; }
    .medications-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .medications-table th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #ddd; }
    .medications-table td { padding: 10px; border: 1px solid #ddd; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
    .signature { margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">Hometown Pharmacy Clinic</div>
    <div class="rx-number">Prescription #: ${prescription.prescription_number}</div>
    <div class="rx-number">Date: ${new Date(prescription.created_at).toLocaleDateString()}</div>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="info-row"><div class="info-label">Patient Name:</div><div class="info-value">${prescription.patients?.full_name}</div></div>
    <div class="info-row"><div class="info-label">Patient Code:</div><div class="info-value">${prescription.patients?.patient_code}</div></div>
    <div class="info-row"><div class="info-label">Date of Birth:</div><div class="info-value">${prescription.patients?.date_of_birth ? new Date(prescription.patients.date_of_birth).toLocaleDateString() : 'N/A'}</div></div>
    <div class="info-row"><div class="info-label">Gender:</div><div class="info-value">${prescription.patients?.gender || 'N/A'}</div></div>
    ${prescription.patients?.allergies ? `<div class="info-row"><div class="info-label">Allergies:</div><div class="info-value" style="color: red; font-weight: bold;">${prescription.patients.allergies}</div></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Doctor Information</div>
    <div class="info-row"><div class="info-label">Doctor Name:</div><div class="info-value">${prescription.doctors?.full_name}</div></div>
    ${prescription.doctors?.specialization ? `<div class="info-row"><div class="info-label">Specialization:</div><div class="info-value">${prescription.doctors.specialization}</div></div>` : ''}
    ${prescription.doctors?.license_number ? `<div class="info-row"><div class="info-label">License Number:</div><div class="info-value">${prescription.doctors.license_number}</div></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Diagnosis & Symptoms</div>
    <div class="info-row"><div class="info-label">Diagnosis:</div><div class="info-value">${prescription.diagnosis}</div></div>
    ${prescription.symptoms ? `<div class="info-row"><div class="info-label">Symptoms:</div><div class="info-value">${prescription.symptoms}</div></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Medications</div>
    <table class="medications-table">
      <thead>
        <tr>
          <th>Medicine Name</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
          <th>Instructions</th>
        </tr>
      </thead>
      <tbody>
        ${prescription.medications?.map((med: any) => `
          <tr>
            <td><strong>${med.name}</strong></td>
            <td>${med.dosage || '-'}</td>
            <td>${med.frequency || '-'}</td>
            <td>${med.duration || '-'}</td>
            <td>${med.instructions || '-'}</td>
          </tr>
        `).join('') || '<tr><td colspan="5">No medications prescribed</td></tr>'}
      </tbody>
    </table>
  </div>

  ${prescription.notes ? `
  <div class="section">
    <div class="section-title">Additional Notes</div>
    <p>${prescription.notes}</p>
  </div>
  ` : ''}

  ${prescription.follow_up_date ? `
  <div class="section">
    <div class="info-row"><div class="info-label">Follow-up Date:</div><div class="info-value">${new Date(prescription.follow_up_date).toLocaleDateString()}</div></div>
  </div>
  ` : ''}

  <div class="footer">
    <div class="signature">
      <p>_________________________________</p>
      <p>Dr. ${prescription.doctors?.full_name}</p>
      ${prescription.doctors?.license_number ? `<p>License: ${prescription.doctors.license_number}</p>` : ''}
    </div>
  </div>
</body>
</html>
      `.trim();

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.prescription_number}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Prescription downloaded. Open in browser and print to PDF.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prescription #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                No prescriptions found
              </TableCell>
            </TableRow>
          ) : (
            prescriptions.map((rx) => (
              <TableRow key={rx.id}>
                <TableCell className="font-mono text-sm font-semibold">
                  {rx.prescription_number}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(rx.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{rx.patients?.full_name}</p>
                    <p className="text-xs text-gray-500">{rx.patients?.patient_code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{rx.doctors?.full_name}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{rx.diagnosis || "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(rx.status)}>
                    {rx.status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generatePdf(rx)}
                    disabled={generatingPdf === rx.id}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    {generatingPdf === rx.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
