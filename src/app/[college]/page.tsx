import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { colleges, getCollege } from "@/lib/data";
import CampusNav from "@/components/campus/CampusNav";
import CampusHero from "@/components/campus/CampusHero";
import Marquee from "@/components/campus/Marquee";
import EventsCarousel from "@/components/campus/EventsCarousel";
import SpotlightEvent from "@/components/campus/SpotlightEvent";
import ClubsSection from "@/components/campus/ClubsSection";
import CampusCTA from "@/components/campus/CampusCTA";

interface CampusPageProps {
  params: Promise<{ college: string }>;
}

export function generateStaticParams() {
  return colleges.map((c) => ({ college: c.slug }));
}

export async function generateMetadata({ params }: CampusPageProps): Promise<Metadata> {
  const { college: collegeSlug } = await params;
  const college = getCollege(collegeSlug);

  if (!college) {
    return { title: "Campus Not Found · CampusLoop" };
  }

  return {
    title: `${college.name} Events & Clubs`,
    description: college.tagline,
  };
}

export default async function CampusPage({ params }: CampusPageProps) {
  const { college: collegeSlug } = await params;
  const college = getCollege(collegeSlug);

  if (!college) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream text-warm-ink">
      <CampusNav college={college} />
      <main className="flex-1">
        {college.status === "demo" && (
          <section className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8 lg:py-6">
            <div className="rounded-2xl border border-warm-ink/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden />
                <span className="text-sm font-semibold text-warm-ink/80">
                  You&apos;re viewing a demo college. All data is sample.
                </span>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-warm-ink px-5 text-sm font-semibold text-cream transition-colors hover:bg-ink-900"
                >
                  Back to landing
                </Link>
                <Link
                  href="#cta"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-coral px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                >
                  Get early access
                </Link>
              </div>
            </div>
          </section>
        )}
        <CampusHero college={college} />
        <Marquee />
        <section id="lineup" className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <EventsCarousel college={college} />
        </section>
        <SpotlightEvent college={college} />
        <ClubsSection collegeId={college.slug} />
      </main>
      <CampusCTA />
    </div>
  );
}
