import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artchive",
  description: "A corkboard-style home for your artwork references, notes, sketches, and finished pieces."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="en"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      data-lt-active="false"
    >
      <body
        suppressHydrationWarning
        spellCheck={false}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        data-lt-active="false"
      >
        {measurementId ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={measurementId} />
          </Suspense>
        ) : null}
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
