"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, ExternalLink } from "lucide-react";

export function CollectFeedbackCard({
  websiteUrl,
  qrUrl,
  qrDataUrl,
}: {
  websiteUrl: string;
  qrUrl: string;
  qrDataUrl: string;
}) {
  const [copiedWebsite, setCopiedWebsite] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  async function copy(text: string, which: "website" | "qr") {
    await navigator.clipboard.writeText(text);
    if (which === "website") {
      setCopiedWebsite(true);
      setTimeout(() => setCopiedWebsite(false), 2000);
    } else {
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium">Website feedback form</p>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Share this link anywhere, or embed it on your site — no login required for customers.
        </p>
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[rgb(var(--surface-border))] bg-[rgb(var(--surface)/0.5)] px-3 py-2">
          <code className="flex-1 truncate text-xs">{websiteUrl}</code>
          <button onClick={() => copy(websiteUrl, "website")} className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Copy link">
            {copiedWebsite ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <a href={websiteUrl} target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm" className="mt-3">
            <ExternalLink className="h-3.5 w-3.5" /> Preview form
          </Button>
        </a>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">QR code feedback</p>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Print this on receipts, tables, or packaging. Scans are tagged as QR feedback automatically.
        </p>
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-[var(--radius-md)] bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code linking to feedback form" className="h-28 w-28" />
          </div>
          <div className="flex flex-col gap-2">
            <a href={qrDataUrl} download="loop-feedback-qr.png">
              <Button variant="secondary" size="sm">
                <Download className="h-3.5 w-3.5" /> Download PNG
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={() => copy(qrUrl, "qr")}>
              {copiedQr ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} Copy QR link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
