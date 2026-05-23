import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold">ReviewBoost AI</h3>
          <p className="mt-3 text-sm text-slate-300">Compliance-safe AI review management for hospitality and local businesses.</p>
        </div>
        {["Product", "Company", "Legal"].map((group) => (
          <div key={group}>
            <h4 className="font-semibold">{group}</h4>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <Link href="/features">Features</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-slate-300">Designed & Developed by Yash Infosystems</div>
    </footer>
  );
}
