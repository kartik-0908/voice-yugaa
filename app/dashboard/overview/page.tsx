import {
  getTotalCalls,
  getTotalCallsDuration,
  getAllExecutionTimestamps,
} from "@/app/actions/analytics";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, TrendingUp } from "lucide-react";
import { CallsChart } from "@/components/totalChart";

async function StatsCards() {
  const [total, duration] = await Promise.all([
    getTotalCalls(),
    getTotalCallsDuration(),
  ]);

  const averageDuration = total > 0 ? Math.round(duration / total) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = [
    {
      title: "Total Calls",
      value: total.toLocaleString(),
      icon: Phone,
      description: "Total number of calls",
    },
    {
      title: "Total Duration",
      value: formatDuration(duration),
      icon: Clock,
      description: `${Math.round(duration / 60)} minutes total`,
    },
    {
      title: "Average Duration",
      value: formatDuration(averageDuration),
      icon: TrendingUp,
      description: "Per call average",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function CallsChartWrapper() {
  const timestamps = await getAllExecutionTimestamps();
  return <CallsChart data={timestamps} />;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-[160px] rounded-lg" />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor your call statistics and performance metrics
        </p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <CallsChartWrapper />
      </Suspense>
    </div>
  );
}
