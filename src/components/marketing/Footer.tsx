export default function Footer() {
  return (
    <footer className="bg-ink-950 text-white/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 19V5l14 14V5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-white">CampusLoop</span>
          </a>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            The operations platform for student clubs — plan, launch and measure campus life at scale.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h4>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "How it works", href: "#steps" },
              { label: "Before &amp; after", href: "#before-after" },
              { label: "Admin trust", href: "#admin-trust" },
              { label: "Live feed", href: "#live-feed" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Colleges</h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="https://lbrce.ac.in" className="transition-colors hover:text-white" rel="noopener noreferrer">
                LBRCE
              </a>
            </li>
            {["Northwood University", "Crestview College", "Bellavista Institute", "Westbrook University"].map((l) => (
              <li key={l}>
                <a href={`/${l.split(" ")[0].toLowerCase()}`} className="transition-colors hover:text-white">
                  {l} <span className="text-white/40">(demo)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="mailto:hello@campusloop.io" className="transition-colors hover:text-white">
                hello@campusloop.io
              </a>
            </li>
            <li>
              <a href="#cta" className="transition-colors hover:text-white">
                Book a 15-minute setup call
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm lg:flex-row lg:px-8">
          <p>© 2026 CampusLoop Labs. Built for the people who run the parties.</p>
          <p>Made with ♥ for student orgs everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
