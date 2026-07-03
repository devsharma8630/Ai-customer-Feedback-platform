import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[image:var(--accent-gradient)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Loop
        </Link>
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
