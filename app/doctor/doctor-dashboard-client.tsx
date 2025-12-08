"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, Search, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreatePrescriptionDialog from "./create-prescription-dialog";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string | null;
  email: string;
}

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  email: string | null;
  blood_type: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  current_medications: string | null;
  status: string;
  prescriptions?: any[];
}

interface DoctorDashboardClientProps {
  doctor: Doctor;
  patients: Patient[];
}

export default function DoctorDashboardClient({ doctor, patients }: DoctorDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);

  const activePatients = patients.filter(p => p.status === "active");
  const totalPrescriptions = patients.reduce((acc, p) => acc + (p.prescriptions?.length || 0), 0);

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-blue-100">
            Welcome, Dr. {doctor.full_name}
            {doctor.specialization && ` • ${doctor.specialization}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Active Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activePatients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Total Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{totalPrescriptions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Patients</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        No patients assigned
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => {
                      const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
                      return (
                        <TableRow key={patient.id}>
                          <TableCell className="font-mono text-sm">{patient.patient_code}</TableCell>
                          <TableCell className="font-medium">{patient.full_name}</TableCell>
                          <TableCell>{age} years</TableCell>
                          <TableCell>{patient.blood_type || "-"}</TableCell>
                          <TableCell>{patient.phone || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                patient.status === "active"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleCreatePrescription(patient)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Prescription
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Prescription Dialog */}
      {selectedPatient && (
        <CreatePrescriptionDialog
          open={showPrescriptionDialog}
          onClose={() => {
            setShowPrescriptionDialog(false);
            setSelectedPatient(null);
          }}
          patient={selectedPatient}
          doctorId={doctor.id}
        />
      )}
    </div>
  );
}
