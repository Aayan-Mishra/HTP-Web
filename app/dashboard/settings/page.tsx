import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId || !isAdmin(userId)) {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Configure system settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-teal-600" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Settings features are under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This page will allow you to configure system settings, manage user permissions, 
            and customize dashboard preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
