"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({
  children,
  navbar,
  contactCTA,
  footer,
  bottomNav,
  whatsAppFloat,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  contactCTA: React.ReactNode;
  footer: React.ReactNode;
  bottomNav: React.ReactNode;
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
  const isWorkspace = segments.length > 0 && !marketingPaths.includes(segments[0]) && !isFile;

  if (isWorkspace) {
    return (
      <div className="workspace-theme min-h-screen w-full bg-[#F8F4EE] text-[#4A3E3D] antialiased selection:bg-[#EADBC8] selection:text-[#4A3E3D] z-50 relative flex flex-col">
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      {navbar}
      <main className="flex-grow">
        {children}
      </main>
      {contactCTA}
      {footer}
      {bottomNav}
      {whatsAppFloat}
    </div>
  );
}
