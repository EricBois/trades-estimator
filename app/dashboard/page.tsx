import { getDashboardStats } from "@/lib/data";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { stats, recentProjects, standaloneEstimates, allEstimates, profile } =
    await getDashboardStats();

  return (
    <DashboardContent
      stats={stats}
      recentProjects={recentProjects}
      standaloneEstimates={standaloneEstimates}
      allEstimates={allEstimates}
      profile={profile}
    />
  );
}
