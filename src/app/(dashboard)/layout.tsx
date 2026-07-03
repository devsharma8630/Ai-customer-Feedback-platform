import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNavProvider } from "@/components/providers/mobile-nav-provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, company } = await getCurrentProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen">
        <Sidebar role={profile.role} companyName={company?.name ?? "Your workspace"} />
        <div className="min-w-0 flex-1 px-4 py-4 lg:px-6">
          <Topbar userName={profile.full_name} avatarUrl={profile.avatar_url} />
          <main className="pb-10">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
