import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/actions/public-feedback.actions";
import { PublicFeedbackForm } from "@/components/public/public-feedback-form";

export default async function PublicFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { slug } = await params;
  const { source } = await searchParams;

  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const channel = source === "qr" ? "qr_code" : "website_form";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <PublicFeedbackForm companySlug={slug} companyName={company.name} channel={channel} />
      </div>
    </div>
  );
}
