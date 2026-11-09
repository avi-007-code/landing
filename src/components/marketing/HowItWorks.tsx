const steps = [
  {
    n: "01",
    title: "Create your club house",
    body: "One form, ten minutes, done. Your club gets a profile, a calendar and a home base on CampusLoop.",
  },
  {
    n: "02",
    title: "Plan & launch events",
    body: "Drop an event, set reminders and approvals, and let the pipeline handle the comms.",
  },
  {
    n: "03",
    title: "Measure & grow",
    body: "Attendance data and feedback reports turn every event into your next best one.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">How it works</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Live in three steps. <br /> No committee required.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-3xl border border-ink-900/5 bg-white p-8">
              <span className="font-display text-6xl font-bold text-brand-600/20">{s.n}</span>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink-900">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-900/60">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
