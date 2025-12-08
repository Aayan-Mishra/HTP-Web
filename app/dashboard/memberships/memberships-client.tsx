"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, TrendingUp, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateMembershipDialog from "./create-membership-dialog";
import MembershipsTable from "./memberships-table";
import TransactionsTable from "./transactions-table";

interface MembershipsClientProps {
  tiers: any[];
  memberships: any[];
  transactions: any[];
}

export default function MembershipsClient({ tiers, memberships, transactions }: MembershipsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const stats = {
    totalMembers: memberships.length,
    activeMemberships: memberships.filter(m => m.status === "active").length,
    totalPointsIssued: memberships.reduce((sum, m) => sum + (m.points_balance || 0), 0),
    tierDistribution: tiers.map(tier => ({
      tier: tier.name,
      count: memberships.filter(m => m.tier_id === tier.id).length,
    })),
  };

  const filteredMemberships = memberships.filter(m =>
    m.membership_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMembershipCreated = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Management</h1>
          <p className="text-gray-500 mt-1">Manage customer memberships and loyalty points</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Membership
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMembers}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Memberships</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeMemberships}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPointsIssued.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Membership Tiers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{tiers.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.tierDistribution.map((tier) => (
            <div key={tier.tier} className="text-center">
              <Badge className="mb-2">{tier.tier}</Badge>
              <p className="text-2xl font-bold">{tier.count}</p>
              <p className="text-sm text-gray-500">members</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="memberships" className="space-y-4">
        <TabsList>
          <TabsTrigger value="memberships">All Memberships</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="memberships" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by membership code, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <MembershipsTable memberships={filteredMemberships} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTable transactions={transactions} memberships={memberships} />
        </TabsContent>
      </Tabs>

      <CreateMembershipDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onMembershipCreated={handleMembershipCreated}
        tiers={tiers}
      />
    </div>
  );
}
