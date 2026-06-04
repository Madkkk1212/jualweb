import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TechStack } from "@/components/sections/TechStack";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";

import { faqs } from "@/data/faqs";
import {
  getBreadcrumbSchema,
  getFaqPageSchema,
  getHowToOrderSchema,
  getOrganizationSchema,
  getServiceListSchema,
  getSpeakableSchema,
  getDefinedTermSchema,
  getWebsiteSchema,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Jual Website Jambi — Jasa Buat Website Dealer, Bimbel, Umroh & UMKM | LumaSpace",
  description:
    "LumaSpace: jasa pembuatan website profesional di Jambi. Spesialis website dealer mobil, bimbel, travel umroh, konstruksi, toko online, dan company profile. Desain premium, SEO-friendly, harga mulai Rp299.000. Konsultasi gratis!",
  keywords: [
    "jual website Jambi",
    "jual web Jambi",
    "beli website Jambi",
    "penjualan website Jambi",
    "jasa pembuatan website Jambi",
    "jasa website dealer mobil Jambi",
    "jasa website bimbel Jambi",
    "jasa website umroh Jambi",
    "jasa website konstruksi Jambi",
    "website UMKM Jambi",
    "website profesional Jambi",
    "jasa bikin website murah Jambi",
    "LumaSpace Jambi",
    "jasa pembuatan website Muaro Jambi",
    "jasa pembuatan website Bungo",
    "jasa pembuatan website Tebo",
    "jasa pembuatan website Sarolangun",
    "jasa pembuatan website Merangin",
    "jasa pembuatan website Kerinci",
    "jasa pembuatan website Sungai Penuh",
    "jasa pembuatan website Tanjung Jabung Barat",
    "jasa pembuatan website Tanjung Jabung Timur",
    "jasa pembuatan website Batanghari",
    "jasa website e-commerce Jambi",
    "website rental mobil Jambi",
    "website sales mobil Jambi",
    "website sekolah Jambi",
    "website toko online Jambi",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: "Jual Website Jambi — Dealer, Bimbel, Umroh & UMKM | LumaSpace",
    description:
      "Jasa pembuatan website profesional di Jambi. Spesialis dealer mobil, bimbel, umroh haji, konstruksi, toko online, dan company profile. Mulai dari Rp299.000.",
  },
};

export default function Home() {
  const speakable = getSpeakableSchema(siteConfig.url, ["h1", ".hero-description", ".faq-content"]);
  const definedTerms = getDefinedTermSchema();
  const schemas = [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getServiceListSchema(),
    getFaqPageSchema(faqs),
    getHowToOrderSchema(),
    speakable,
    ...definedTerms,
    getBreadcrumbSchema([{ name: "Beranda", path: "/" }]),
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="relative">
        <Hero />
        <TechStack />
        <Features />

        <Testimonials />
      </div>
    </>
  );
}