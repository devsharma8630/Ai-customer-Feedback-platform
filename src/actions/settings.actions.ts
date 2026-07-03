"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { revalidatePath } from "next/cache";

export async function createDepartmentAction(formData: FormData) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found" };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Department name is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("departments").insert({ company_id: profile.company_id, name });
  if (error) return { error: "Could not create department" };

  revalidatePath("/settings");
  return { success: true };
}

export async function createCategoryAction(formData: FormData) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found" };

  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#6E5CF6";
  if (!name?.trim()) return { error: "Category name is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_categories").insert({ company_id: profile.company_id, name, color });
  if (error) return { error: "Could not create category" };

  revalidatePath("/settings");
  return { success: true };
}

export async function updateCompanyProfileAction(formData: FormData) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found" };
  if (profile.role !== "company_admin" && profile.role !== "super_admin") {
    return { error: "Only company admins can update company settings" };
  }

  const name = formData.get("name") as string;
  const industry = formData.get("industry") as string;
  const website = formData.get("website") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ name, industry, website })
    .eq("id", profile.company_id);

  if (error) return { error: "Could not update company profile" };
  revalidatePath("/settings");
  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const { profile } = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const fullName = formData.get("fullName") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const phone = formData.get("phone") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, job_title: jobTitle, phone })
    .eq("id", profile.id);

  if (error) return { error: "Could not update profile" };
  revalidatePath("/settings");
  return { success: true };
}

export async function inviteTeamMemberAction(formData: FormData) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) return { error: "No company found" };

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email) return { error: "Email is required" };

  // In production this triggers a Supabase invite email (auth.admin.inviteUserByEmail
  // via a service-role edge function) that pre-associates the company_id and role.
  // Scaffolded here as a pending-invite record for the admin to track.
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    company_id: profile.company_id,
    user_id: profile.id,
    title: "Invite queued",
    body: `An invite for ${email} (${role}) will be sent once email delivery is configured.`,
  });

  if (error) return { error: "Could not queue invite" };
  revalidatePath("/settings");
  return { success: true };
}
