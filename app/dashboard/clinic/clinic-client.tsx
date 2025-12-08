"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Users, FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddDoctorDialog from "./add-doctor-dialog";
import AddPatientDialog from "./add-patient-dialog";
import DoctorsTable from "./doctors-table";
import PatientsTable from "./patients-table";
import PrescriptionsTable from "./prescriptions-table";

interface ClinicClientProps {
  doctors: any[];
  patients: any[];
  prescriptions: any[];
}

export default function ClinicClient({ doctors, patients, prescriptions }: ClinicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);

  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => d.status === "active").length,
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === "active").length,
    pendingPrescriptions: prescriptions.filter(p => p.status === "pending" || p.status === "sent_to_pharmacy").length,
  };

  const filteredDoctors = doctors.filter(d =>
    d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    p.patient_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Management</h1>
          <p className="text-gray-500 mt-1">Manage doctors, patients, and prescriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDoctors}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeDoctors}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activePatients}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Rx</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingPrescriptions}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="doctors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors by name, email, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setAddDoctorOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </div>

          <DoctorsTable doctors={filteredDoctors} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by code, name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setAddPatientOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>

          <PatientsTable patients={filteredPatients} doctors={doctors} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionsTable prescriptions={prescriptions} onUpdate={handleRefresh} />
        </TabsContent>
      </Tabs>

      <AddDoctorDialog
        open={addDoctorOpen}
        onClose={() => setAddDoctorOpen(false)}
        onAdded={handleRefresh}
      />

      <AddPatientDialog
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        onAdded={handleRefresh}
        doctors={doctors}
      />
    </div>
  );
}
