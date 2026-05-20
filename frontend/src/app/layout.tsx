import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { MainLayout } from "@/components/layout/main-layout";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام إدارة الشاليهات | Chalet Management System",
  description: "نظام متكامل لإدارة وتأجير الشاليهات والحجوزات والمصروفات والتقارير",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
