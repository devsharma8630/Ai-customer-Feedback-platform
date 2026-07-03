import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Loop — AI Customer Feedback Intelligence",
  description:
    "Loop turns every piece of customer feedback into a clear, prioritized action — powered by AI sentiment analysis, auto-summaries, and a live assistant that knows your data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <div className="ambient-bg" aria-hidden="true" />
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
