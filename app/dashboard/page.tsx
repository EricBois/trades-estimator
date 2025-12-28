import { getDashboardStats } from "@/lib/data";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { stats, recentEstimates, profile } = await getDashboardStats();

  return (
    <DashboardContent
      stats={stats}
      recentEstimates={recentEstimates}
      profile={profile}
    />
  );
}
