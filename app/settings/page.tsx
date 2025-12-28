import { getAuthenticatedUser } from "@/lib/data";
import { SettingsContent } from "./SettingsContent";

export default async function SettingsPage() {
  const { profile } = await getAuthenticatedUser();

  return <SettingsContent profile={profile} />;
}
