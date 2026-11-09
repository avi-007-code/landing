export default function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-transparent to-coral/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-ink-900/10 bg-white shadow-2xl shadow-black/5">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-ink-900/10 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-coral" />
          <span className="h-2.5 w-2.5 rounded-full bg-orange" />
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          <div className="ml-3 flex h-7 flex-1 items-center justify-center rounded-lg bg-ink-900/[0.04] px-4 text-xs text-ink-900/50">
            app.campusloop.io/dashboard
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {/* stat cards */}
          <div className="rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-900/50">Attendance</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-950">87%</p>
            <div className="mt-3 flex h-12 items-end gap-1.5">
              {[35, 55, 42, 68, 52, 80, 64].map((h, i) => (
                <span key={i} className="flex-1 rounded-t-md bg-brand-500/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-900/50">Events run</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-950">23</p>
            <p className="mt-2 text-xs text-emerald-600">+31% vs last month</p>
          </div>

          {/* upcoming events */}
          <div className="rounded-2xl border border-ink-900/5 bg-ink-900/[0.03] p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-900/50">Up next</p>
            <div className="mt-3 space-y-2.5">
              {[
                { t: "Midnight Melody — Fall Concert", d: "Sat · 7:30 PM · Amphitheatre" },
                { t: "RoboRush: Build-a-Bot Finals", d: "Sat · 10:00 AM · Innovation Lab" },
                { t: "Neon Nights: Dance Fest", d: "Fri · 9:00 PM · Gymnasium" },
              ].map((e) => (
                <div key={e.t} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-ink-900/5">
                  <p className="truncate text-sm font-semibold text-ink-950">{e.t}</p>
                  <p className="shrink-0 text-xs text-ink-900/50">{e.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating live-status chips */}
      <div className="absolute -top-5 -left-5 z-10 rounded-2xl border border-ink-900/10 bg-ink-900/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">● Live now</p>
        <p className="mt-0.5 text-sm font-semibold text-white">Rally approved</p>
      </div>
      <div className="absolute -bottom-5 -left-5 z-10 rounded-2xl border border-ink-900/10 bg-ink-800/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Attendance</p>
        <p className="font-display text-xl font-bold text-white">87%</p>
      </div>

      {/* event poster card */}
      <div className="absolute -top-5 -right-5 z-10 w-52 rounded-2xl border-2 border-ink-900 bg-gradient-to-br from-amber-500 to-orange p-4 shadow-2xl shadow-black/40">
        <p className="font-campus text-2xl font-bold uppercase leading-tight text-cream">Midnight Melody</p>
        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/80">Sat · Nov 21 · 7:30 PM</p>
        <p className="mt-1 text-xs font-medium text-cream/70">Open Air Amphitheatre</p>
      </div>
    </div>
  );
}
