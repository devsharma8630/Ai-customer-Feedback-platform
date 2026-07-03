"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  companyName: z.string().min(2, "Enter your company name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUpAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, companyName, email, password } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message ?? "Could not create account" };
  }

  // Provision the company + admin profile using the service role
  // (the new session may not be established yet for RLS-protected inserts).
  const service = createServiceClient();

  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + authData.user.id.slice(0, 6);

  const { data: company, error: companyError } = await service
    .from("companies")
    .insert({ name: companyName, slug })
    .select()
    .single();

  if (companyError) {
    return { error: "Account created, but company setup failed. Contact support." };
  }

  const { error: profileError } = await service.from("profiles").insert({
    id: authData.user.id,
    company_id: company.id,
    role: "company_admin",
    full_name: fullName,
  });

  if (profileError) {
    return { error: "Account created, but profile setup failed. Contact support." };
  }

  return { success: true, needsEmailVerification: !authData.session };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Enter your email address" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  redirect("/dashboard");
}
