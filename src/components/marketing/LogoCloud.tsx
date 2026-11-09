const logos = [
  "Northwood University",
  "Crestview College",
  "Bellavista Institute",
  "Westbrook University",
  "Meridian University",
  "Cedar Ridge College",
];

export default function LogoCloud() {
  return (
    <section id="colleges" className="border-b border-ink-900/5 bg-white py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-900/40">
          Powering events at 250+ campuses worldwide
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-5">
          {logos.map((l) => (
            <span key={l} className="font-display text-xl font-bold uppercase tracking-wide text-ink-900/55">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
