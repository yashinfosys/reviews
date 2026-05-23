import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const links = ["Features", "Pricing", "Demo", "Contact"];
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">ReviewBoost AI</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link} href={`/${link.toLowerCase()}`} className="text-sm font-medium text-slate-700 hover:text-primary">
              {link}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login"><Button variant="ghost">Login</Button></Link>
          <Link href="/register"><Button>Start Free Trial</Button></Link>
        </div>
      </div>
    </header>
  );
}
