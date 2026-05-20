import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedAI Scribe — Clinical Decision Support",
  description:
    "AI-assisted SOAP note generation and differential diagnosis support tool for clinicians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased bg-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
