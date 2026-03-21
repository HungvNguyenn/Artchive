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
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
