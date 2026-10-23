import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoPulse AI — Environmental Intelligence Agent for Pune & PCMC",
  description: "Autonomous multi-step environmental intelligence agent evaluating real atmospheric data, risk matrices, and targeted public health advisories across Pune and Pimpri-Chinchwad.",
  keywords: ["EcoPulse AI", "Air Quality Pune", "PCMC Air Quality", "Environmental Intelligence", "Gemini 3.8 Flash", "Open-Meteo", "Atmospheric Health"],
  authors: [{ name: "EcoPulse AI Engineering" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#FAF7F2]">
      <body className="min-h-full flex flex-col text-[#1F2421] selection:bg-[#C85A32]/20 selection:text-[#1F2421]">
        {children}
      </body>
    </html>
  );
}
