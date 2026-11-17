"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, MapPin, Plus, Printer, Users } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useSelection } from "@/hooks/use-selection";
import { computeStats, stateDistribution } from "@/lib/dashboard-stats";
import { Button, LinkButton } from "@/components/common/button";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/empty-state";
import { MiniStat, StatCard } from "./stat-card";
import { StateDistribution } from "./state-distribution";
import { RecentCustomers } from "./recent-customers";

export function DashboardView() {
  const router = useRouter();
  const { customers, loading } = useCustomers();
  const { selected } = useSelection();
  const stats = useMemo(() => computeStats(customers), [customers]);
  const distribution = useMemo(() => stateDistribution(customers), [customers]);
  const recent = useMemo(() => [...customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [customers]);
  const selectedCount = customers.filter((c) => selected.has(c.id)).length;

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back — manage your customer addresses in one place." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="blue" label="Total Customers" value={stats.total} icon={Users} />
        <StatCard tone="gold" label="States Covered" value={stats.states} icon={MapPin} />
        <StatCard tone="purple" label="Districts" value={stats.districts} icon={MapPin} />
        <StatCard tone="green" label="PIN Codes" value={stats.pins} icon={MapPin} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MiniStat label="Active customers" value={stats.active} />
        <MiniStat label="Cities covered" value={stats.cities} />
        <MiniStat label="Added in last 7 days" value={stats.recentlyAdded} />
        <MiniStat label="Updated in last 7 days" value={stats.recentlyUpdated} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:items-start">
        <StateDistribution data={distribution} total={Math.max(1, customers.length)} />
        <RecentCustomers items={recent} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton href="/customers/add" variant="primary" className="min-h-12 px-6"><Plus className="h-4 w-4" /> Add Customer</LinkButton>
        <LinkButton href="/customers" variant="outline" className="min-h-12 px-6"><Users className="h-4 w-4" /> View Customers</LinkButton>
        <Button variant="outline" className="min-h-12 px-6" onClick={() => router.push("/printing")}><Printer className="h-4 w-4" /> Print Selected ({selectedCount})</Button>
        <LinkButton href="/import-export" variant="outline" className="min-h-12 px-6"><ArrowLeftRight className="h-4 w-4" /> Import Customers</LinkButton>
      </div>
    </>
  );
}
