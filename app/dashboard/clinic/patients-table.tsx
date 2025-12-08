"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function PatientsTable({ patients, doctors, onUpdate }: { patients: any[]; doctors: any[]; onUpdate: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Doctor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                No patients found
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-mono text-sm font-semibold text-teal-600">
                  {patient.patient_code}
                </TableCell>
                <TableCell className="font-medium">{patient.full_name}</TableCell>
                <TableCell className="text-sm">{patient.phone || "-"}</TableCell>
                <TableCell className="text-sm text-gray-600">{patient.email || "-"}</TableCell>
                <TableCell className="text-sm">
                  {patient.doctors?.full_name || "-"}
                  {patient.doctors?.specialization && (
                    <span className="text-xs text-gray-500 ml-1">({patient.doctors.specialization})</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={patient.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
