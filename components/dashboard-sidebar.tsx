"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Pill,
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  CheckCircle,
  Settings,
  Home,
  Stethoscope,
} from "lucide-react";

interface DashboardSidebarProps {
  isAdmin: boolean;
  isDoctor?: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    title: "Verify Pickup",
    href: "/dashboard/verify",
    icon: CheckCircle,
    adminOnly: false,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    adminOnly: true,
  },
  {
    title: "Memberships",
    href: "/dashboard/memberships",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Clinic",
    href: "/dashboard/clinic",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export default function DashboardSidebar({ isAdmin, isDoctor }: DashboardSidebarProps) {
  const pathname = usePathname();

  const visibleItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <Pill className="h-8 w-8 text-teal-600" />
          <span className="font-poppins font-bold text-gray-900 text-lg">
            Hometown
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* Doctor Dashboard Link */}
        {isDoctor && (
          <Link
            href="/doctor"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
              pathname === "/doctor"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Stethoscope className={cn("h-5 w-5", pathname === "/doctor" && "text-blue-600")} />
            <span>Doctor Dashboard</span>
          </Link>
        )}
        
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-teal-600")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
}
