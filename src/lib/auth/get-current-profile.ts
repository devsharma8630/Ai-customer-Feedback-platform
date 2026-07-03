import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Company } from "@/types/database.types";

export async function getCurrentProfile(): Promise<{
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  company: Company | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null, company: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let company: Company | null = null;
  if (profile?.company_id) {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();
    company = data;
  }

  return { user: { id: user.id, email: user.email ?? null }, profile, company };
}

/** Throws-free role check helper for gating UI/actions. */
export function can(profile: Profile | null, action: string): boolean {
  if (!profile) return false;
  const role = profile.role;

  const permissions: Record<string, string[]> = {
    manage_companies: ["super_admin"],
    manage_platform_settings: ["super_admin"],
    delete_company: ["super_admin"],
    invite_team: ["super_admin", "company_admin"],
    manage_departments: ["super_admin", "company_admin"],
    manage_categories: ["super_admin", "company_admin"],
    generate_ai_reports: ["super_admin", "company_admin"],
    assign_feedback: ["super_admin", "company_admin", "manager"],
    export_reports: ["super_admin", "company_admin", "manager"],
    view_all_dashboards: ["super_admin", "company_admin", "manager"],
    reply_to_feedback: ["super_admin", "company_admin", "manager", "employee"],
    update_feedback_status: ["super_admin", "company_admin", "manager", "employee"],
  };

  return permissions[action]?.includes(role) ?? false;
}
