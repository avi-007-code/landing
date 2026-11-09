import Nav from "@/components/marketing/Nav";
import Hero from "@/components/marketing/Hero";
import Colleges from "@/components/marketing/Colleges";
import AudienceSwitcher from "@/components/marketing/AudienceSwitcher";
import LiveFeed from "@/components/marketing/LiveFeed";
import BeforeAfter from "@/components/marketing/BeforeAfter";
import AdminTrust from "@/components/marketing/AdminTrust";
import Steps from "@/components/marketing/Steps";
import CTABand from "@/components/marketing/CTABand";
import Footer from "@/components/marketing/Footer";

export const metadata = {
  title: "CampusLoop — The Operating System for Campus Clubs",
  description:
    "The operations platform for student clubs — plan, launch and measure campus life at scale. Events, registrations and QR check-ins in one place.",
  openGraph: {
    title: "CampusLoop — The Operating System for Campus Clubs",
    description:
      "Events, registrations and QR check-ins for student clubs, all in one platform.",
    type: "website",
    url: "https://campusloop.io",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CampusLoop preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — The Operating System for Campus Clubs",
    description: "Events, registrations and QR check-ins for student clubs, all in one platform.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white text-ink-950">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Colleges />
        <AudienceSwitcher />
        <LiveFeed />
        <BeforeAfter />
        <AdminTrust />
        <Steps />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
