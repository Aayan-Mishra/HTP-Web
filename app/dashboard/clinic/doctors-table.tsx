"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";

export default function DoctorsTable({ doctors, onUpdate }: { doctors: any[]; onUpdate: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                No doctors found
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium">{doctor.full_name}</TableCell>
                <TableCell className="text-sm text-gray-600">{doctor.email}</TableCell>
                <TableCell>{doctor.specialization || "-"}</TableCell>
                <TableCell className="font-mono text-sm">{doctor.license_number || "-"}</TableCell>
                <TableCell className="text-sm">{doctor.phone || "-"}</TableCell>
                <TableCell>
                  <Badge className={doctor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {doctor.status}
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
