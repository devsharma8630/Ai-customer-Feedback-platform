import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/settings/settings-form";
import { CollectFeedbackCard } from "@/components/settings/collect-feedback-card";
import QRCode from "qrcode";
import {
  createDepartmentAction,
  createCategoryAction,
  updateCompanyProfileAction,
  updateProfileAction,
  inviteTeamMemberAction,
} from "@/actions/settings.actions";

export default async function SettingsPage() {
  const { profile, company } = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: departments }, { data: categories }, { data: team }] = await Promise.all([
    supabase.from("departments").select("*").eq("company_id", profile?.company_id ?? "").order("name"),
    supabase.from("feedback_categories").select("*").eq("company_id", profile?.company_id ?? "").order("name"),
    supabase.from("profiles").select("*").eq("company_id", profile?.company_id ?? "").order("created_at"),
  ]);

  const isAdmin = profile?.role === "company_admin" || profile?.role === "super_admin";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const websiteUrl = company?.slug ? `${siteUrl}/f/${company.slug}` : "";
  const qrUrl = company?.slug ? `${siteUrl}/f/${company.slug}?source=qr` : "";
  const qrDataUrl = qrUrl ? await QRCode.toDataURL(qrUrl, { margin: 1, width: 320, color: { dark: "#12121A", light: "#FFFFFF" } }) : "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage your workspace, departments, and team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <SettingsForm action={updateProfileAction} successMessage="Profile updated">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile?.full_name} required />
            </div>
            <div>
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={profile?.job_title ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
            </div>
          </div>
        </SettingsForm>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
            <CardDescription>Visible to your whole team</CardDescription>
          </CardHeader>
          <SettingsForm action={updateCompanyProfileAction} successMessage="Company profile updated">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Company name</Label>
                <Input id="name" name="name" defaultValue={company?.name} required />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" defaultValue={company?.industry ?? ""} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={company?.website ?? ""} />
              </div>
            </div>
          </SettingsForm>
        </Card>
      )}

      {isAdmin && websiteUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Collect feedback</CardTitle>
            <CardDescription>Let customers submit feedback directly — no account needed</CardDescription>
          </CardHeader>
          <CollectFeedbackCard websiteUrl={websiteUrl} qrUrl={qrUrl} qrDataUrl={qrDataUrl} />
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Used to route and report on feedback</CardDescription>
          </CardHeader>
          <div className="mb-4 flex flex-wrap gap-2">
            {(departments ?? []).map((d) => (
              <Badge key={d.id}>{d.name}</Badge>
            ))}
            {(departments ?? []).length === 0 && <p className="text-sm text-[var(--muted)]">No departments yet.</p>}
          </div>
          <SettingsForm action={createDepartmentAction} successMessage="Department created" submitLabel="Add department">
            <Input name="name" placeholder="e.g. Customer Success" required />
          </SettingsForm>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback categories</CardTitle>
          </CardHeader>
          <div className="mb-4 flex flex-wrap gap-2">
            {(categories ?? []).map((c) => (
              <Badge key={c.id} style={{ borderColor: `${c.color}40`, color: c.color, background: `${c.color}1a` }}>
                {c.name}
              </Badge>
            ))}
            {(categories ?? []).length === 0 && <p className="text-sm text-[var(--muted)]">No categories yet.</p>}
          </div>
          <SettingsForm action={createCategoryAction} successMessage="Category created" submitLabel="Add category">
            <div className="flex gap-2">
              <Input name="name" placeholder="e.g. Billing" required />
              <input type="color" name="color" defaultValue="#6E5CF6" className="h-10 w-14 rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-transparent" />
            </div>
          </SettingsForm>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>{(team ?? []).length} members</CardDescription>
          </CardHeader>
          <div className="mb-4 space-y-2">
            {(team ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] px-3 py-2 text-sm">
                <span>{t.full_name}</span>
                <Badge className="capitalize">{t.role.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
          <SettingsForm action={inviteTeamMemberAction} successMessage="Invite queued" submitLabel="Send invite">
            <div className="flex gap-2">
              <Input name="email" type="email" placeholder="teammate@company.com" required className="flex-1" />
              <Select name="role" defaultValue="employee" className="w-40">
                <option value="company_admin">Company admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </Select>
            </div>
          </SettingsForm>
        </Card>
      )}
    </div>
  );
}
