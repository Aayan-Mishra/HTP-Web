"use client";

import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  user: {
    fullName?: string | null;
    email: string;
  };
  isAdmin: boolean;
}

export default function DashboardHeader({ user, isAdmin }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Page Title / Breadcrumb - can be made dynamic later */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Staff Portal
        </h1>
      </div>

      {/* Right Side - User Info & Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.fullName || user?.email}
            </p>
            <div className="flex items-center justify-end gap-1">
              <Badge 
                variant={isAdmin ? "default" : "secondary"} 
                className={isAdmin ? "bg-teal-600" : ""}
              >
                {isAdmin ? "ADMIN" : "STAFF"}
              </Badge>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
