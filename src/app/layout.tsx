import type { Metadata } from "next";
import { Anton, Inter, Sora } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const sora = Sora({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.io"),
  title: {
    default: "CampusLoop — The Operating System for Campus Clubs",
    template: "%s · CampusLoop",
  },
  description:
    "CampusLoop gives student clubs one home to plan events, manage members and fill seats — so campus life finally runs itself.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-ink-950">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
