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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

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
      const patient = prescription.patients;
      const doctor = prescription.doctors;
      const bmi = calculateBMI(patient?.weight, patient?.height);
      
      // Generate medicines HTML with individual tables
      const medicinesHTML = prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map((med: any, index: number) => `
            <table class="medicine-table">
              <tr>
                <td>${index + 1}) ${med.form?.toUpperCase() || 'TAB'}. ${med.name}</td>
                <td>${med.dosage || med.frequency || '1 Morning'}${med.timing ? `<br>(${med.timing})` : ''}</td>
                <td>${med.duration || '7 Days'}${med.total_quantity ? `<br>(Tot:${med.total_quantity})` : ''}</td>
              </tr>
            </table>
            ${med.generic_name || med.composition ? `
              <div class="medicine-details">
                ${med.generic_name || med.composition}
              </div>
            ` : ''}
          `).join('')
        : `<div style="text-align: center; padding: 20px;">No medications prescribed</div>`;
      
      // Create prescription HTML matching the exact sample format
      const prescriptionHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Prescription - ${prescription.prescription_number}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .prescription {
            background-color: white;
            padding: 30px;
            border: 1px solid #ccc;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }
        .doctor-info {
            flex: 1;
        }
        .doctor-info h2 {
            margin: 0 0 5px 0;
            font-size: 18px;
        }
        .doctor-info p {
            margin: 2px 0;
            font-size: 14px;
        }
        .hospital-info {
            flex: 1;
            text-align: right;
        }
        .hospital-info h2 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #0000FF;
        }
        .hospital-info p {
            margin: 2px 0;
            font-size: 13px;
        }
        .caduceus {
            text-align: center;
            font-size: 50px;
            color: #0000FF;
            margin: 0 20px;
        }
        .patient-info {
            margin-top: 30px;
            font-size: 14px;
        }
        .date-right {
            text-align: right;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .patient-details {
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
            font-size: 14px;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .section-title {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .rx-symbol {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0 10px 0;
        }
        .medicine-table {
            margin-bottom: 10px;
        }
        .medicine-details {
            font-size: 12px;
            padding-left: 30px;
            margin: 5px 0;
        }
        .advice {
            margin-top: 20px;
        }
        .advice p {
            margin: 5px 0;
            font-size: 14px;
        }
        .follow-up {
            font-weight: bold;
            margin-top: 20px;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            font-style: italic;
        }
        ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        li {
            margin: 3px 0;
        }
        @media print {
            body { 
                background-color: white;
                margin: 0;
                padding: 0;
            }
            .prescription {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="prescription">
        <div class="header">
            <div class="doctor-info">
                <h2>Dr. ${doctor?.full_name || 'N/A'}</h2>
                <p>${doctor?.qualifications || 'M.S.'}</p>
                ${doctor?.license_number ? `<p>Reg. No: ${doctor.license_number}</p>` : ''}
            </div>
            <div class="caduceus">⚕</div>
            <div class="hospital-info">
                <h2>SMS hospital</h2>
                <p>B/503, Business Center, MG Road, Pune</p>
                <p>- 411000.</p>
                <p>Ph: 5465647658, Timing: 09:00 AM -</p>
                <p>01:00 PM, 06:00 PM - 08:00 PM |</p>
                <p>Closed: Sunday</p>
            </div>
        </div>

        <div class="patient-info">
            <div class="date-right">Date: ${formatDate(prescription.created_at)}</div>
            <div class="patient-details">
                <strong>ID: ${patient?.patient_code || 'N/A'} - OPDG PATIENT (M) / ${patient?.age || 'N/A'} Y &nbsp;&nbsp; Mob. No.: ${patient?.phone || patient?.mobile || 'N/A'}</strong>
            </div>
            <div class="patient-details">
                <strong>Address:</strong> ${patient?.address || 'PUNE'}
            </div>
            <div class="patient-details">
                Weight (Kg): ${patient?.weight || '-'}, Height (Cm): ${patient?.height || '-'}${bmi ? ` (B.M.I. = ${bmi})` : ''}, BP: ${patient?.blood_pressure || '120/80'} mmHg
            </div>
        </div>

        <table>
            <tr>
                <th>Chief Complaints</th>
                <th>Clinical Findings</th>
            </tr>
            <tr>
                <td>
                    <ul>
                        ${prescription.symptoms ? prescription.symptoms.split(',').map((s: string) => `<li>${s.trim()}</li>`).join('') : '<li>General checkup</li>'}
                    </ul>
                </td>
                <td>
                    <ul>
                        <li>THESE ARE TEST FINDINGS FOR A TEST PATIENT</li>
                        <li>ENTERING SAMPLE DIAGNOSIS AND SAMPLE PRESCRIPTION</li>
                    </ul>
                </td>
            </tr>
        </table>

        <div class="section-title">Diagnosis:</div>
        <ul>
            <li>${prescription.diagnosis || 'General consultation'}</li>
        </ul>

        <div class="rx-symbol">℞</div>

        <table class="medicine-table">
            <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Duration</th>
            </tr>
        </table>

        ${medicinesHTML}

        <div class="advice">
            <div class="section-title">Advice:</div>
            <ul>
                ${prescription.notes ? prescription.notes.split('\n').map((note: string) => `<li>${note}</li>`).join('') : ''}
                <li>TAKE BED REST</li>
                <li>DO NOT EAT OUTSIDE FOOD</li>
                <li>EAT EASY TO DIGEST FOOD LIKE BOILED RICE WITH DAAL</li>
            </ul>
        </div>

        ${prescription.follow_up_date ? `<div class="follow-up">Follow Up: ${formatDate(prescription.follow_up_date)}</div>` : ''}

        <div class="footer">
            Substitute with equivalent Generics as required.
        </div>
    </div>

    <script>
        // Auto-print when loaded
        window.onload = function() {
            window.print();
        };
        
        // Close window after printing
        window.onafterprint = function() {
            window.close();
        };
    </script>
</body>
</html>
      `;

      // Open new window with prescription and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(prescriptionHTML);
        printWindow.document.close();
        
        toast({
          title: "PDF Ready",
          description: "Print dialog opened. Save as PDF to download.",
        });
      } else {
        throw new Error('Please allow popups to download prescription PDF');
      }
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
