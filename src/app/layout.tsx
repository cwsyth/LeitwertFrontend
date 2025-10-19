import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Wrapper from "@/components/layout/wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lagebild - Dashboard",
  description: "description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden`}>
            <Wrapper>
                {children}
            </Wrapper>
      </body>
    </html>
  );
}
