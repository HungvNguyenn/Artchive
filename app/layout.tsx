import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
