import type { Metadata } from "next";
import { Services } from "@/components/sections/Services";
import { getBreadcrumbSchema, getServiceListSchema, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Layanan Jasa Website Jambi — Dealer, Bimbel, Umroh, Konstruksi & UMKM",
  description:
    "Layanan pembuatan website profesional LumaSpace di Jambi: website dealer mobil, bimbel & LMS, travel umroh haji, konstruksi, company profile, toko online, dan landing page UMKM. Harga transparan, desain premium.",
  keywords: [
    "layanan jasa website Jambi",
    "jasa website dealer mobil Jambi",
    "jasa website bimbel Jambi",
    "jasa website umroh haji Jambi",
    "jasa website konstruksi Jambi",
    "jasa website company profile Jambi",
    "jasa toko online Jambi",
    "jasa landing page UMKM Jambi",
    "jasa LMS website Jambi",
    "LumaSpace layanan",
    "jasa pembuatan website travel Jambi",
    "jasa pembuatan website kontraktor Jambi",
    "jasa pembuatan website showroom Jambi",
    "jasa buat e-commerce Jambi",
    "jasa pembuatan website skincare Jambi",
    "jasa pembuatan website kuliner Jambi",
    "jasa pembuatan website sekolah Jambi",
    "jasa website undangan pernikahan Jambi",
    "jasa pasang iklan google Jambi",
    "jasa seo website Jambi",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    url: `${siteConfig.url}/services`,
    title: "Layanan Jasa Website Jambi — Dealer, Bimbel, Umroh & Konstruksi | LumaSpace",
    description:
      "Layanan pembuatan website profesional di Jambi oleh LumaSpace: dealer mobil, bimbel, umroh, konstruksi, toko online, dan UMKM.",
  },
};

export default function ServicesPage() {
  const schemas = [
    getServiceListSchema(),
    getBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "Layanan", path: "/services" },
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
      <div className="pt-4 md:pt-20">
        <Services />
      </div>
    </>
  );
}
