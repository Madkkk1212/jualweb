import type { Metadata } from "next";
import PortfolioPageClient from "./PortfolioPageClient";
import { getBreadcrumbSchema, getPortfolioPageSchema, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Portofolio Website Jambi — Dealer Mobil, Bimbel, Umroh, Konstruksi & Lainnya",
  description:
    "Portofolio nyata LumaSpace: website dealer mobil (Luma Dealer), bimbel & LMS (Bimbel Luma, Reiwa LMS), travel umroh Jambi (Atuna Umroh), konstruksi (PT Gemilang Aksara Sejahtera), skincare, restoran, dan berbagai UMKM Jambi.",
  keywords: [
    "portofolio website Jambi",
    "contoh website dealer mobil Jambi",
    "contoh website bimbel Jambi",
    "contoh website umroh Jambi",
    "contoh website konstruksi Jambi",
    "jual website dealer Jambi",
    "jual website bimbel Jambi",
    "jual web umroh Jambi",
    "contoh website company profile Jambi",
    "portofolio jasa web Jambi",
    "LumaSpace portofolio",
    "Luma Dealer website",
    "Atuna Umroh Jambi website",
    "Reiwa LMS website",
    "PT Gemilang Aksara Sejahtera website",
    "Bimbel Luma website",
    "contoh toko online Jambi",
    "contoh landing page Jambi",
    "website travel umroh Jambi live",
    "contoh website sekolah Jambi",
    "demo website dealer mobil Jambi",
  ],
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    url: `${siteConfig.url}/portfolio`,
    title: "Portofolio Website LumaSpace — Dealer, Bimbel, Umroh, Konstruksi & UMKM Jambi",
    description:
      "Portofolio website yang dikerjakan LumaSpace: dealer mobil, bimbel, umroh, konstruksi, toko online, LMS, dan company profile di Jambi.",
  },
};

export default function PortfolioPage() {
  const schemas = [
    getPortfolioPageSchema(),
    getBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "Portofolio", path: "/portfolio" },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PortfolioPageClient />
    </>
  );
}
