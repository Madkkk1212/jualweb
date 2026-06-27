"use client";

import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { BottomNav } from "@/components/ui/BottomNav";

export function LayoutWrapper({
  children,
  contactCTA,
  whatsAppFloat,
}: {
  children: React.ReactNode;
  contactCTA: React.ReactNode;
  whatsAppFloat: React.ReactNode;
}) {
  const pathname = usePathname();

  const marketingPaths = [
    "",
    "contact",
    "faq",
    "portfolio",
    "pricing",
    "process",
    "services",
  ];

  const segments = pathname ? pathname.split("/").filter(Boolean) : [];
  const isFile = segments[0] && segments[0].includes(".");

  // A path is a workspace route if it is not a direct marketing path and not a file asset
  const isWorkspace =
    segments.length > 0 && !marketingPaths.includes(segments[0]) && !isFile;

  if (isWorkspace) {
    return (
      <div className="workspace-theme min-h-screen w-full bg-[#F8F4EE] text-[#4A3E3D] antialiased selection:bg-[#EADBC8] selection:text-[#4A3E3D] z-50 relative flex flex-col">
        <main className="flex-grow flex flex-col">{children}</main>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        {contactCTA}
        <Footer />
        <BottomNav />
        {whatsAppFloat}
        <LanguageSwitcher />
      </div>
    </LanguageProvider>
  );
}
