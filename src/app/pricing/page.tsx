import type { Metadata } from "next";
import { Pricing } from "@/components/sections/Pricing";
import { getBreadcrumbSchema, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Harga Jasa Pembuatan Website Jambi — Mulai Rp299.000 | LumaSpace",
  description:
    "Cek paket harga jasa website LumaSpace di Jambi. Mulai Rp299.000 untuk landing page UMKM hingga paket premium website dealer mobil, bimbel, umroh, dan company profile. Harga transparan, tanpa biaya tersembunyi.",
  keywords: [
    "harga jasa website Jambi",
    "paket harga website Jambi",
    "biaya buat website Jambi",
    "harga website dealer mobil Jambi",
    "harga website bimbel Jambi",
    "harga website umroh Jambi",
    "harga website konstruksi Jambi",
    "tarif jasa web Jambi",
    "website murah profesional Jambi",
    "harga website UMKM Jambi",
    "harga website company profile Jambi",
    "LumaSpace harga paket",
    "harga buat landing page Jambi",
    "harga buat toko online Jambi",
    "biaya bikin web e-commerce Jambi",
    "website murah mulai 299rb Jambi",
    "paket website company profile Jambi",
    "biaya maintenance website Jambi",
    "jasa pemeliharaan website murah Jambi",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    url: `${siteConfig.url}/pricing`,
    title: "Harga Jasa Website Jambi Mulai Rp299rb — Dealer, Bimbel, Umroh & UMKM | LumaSpace",
    description:
      "Paket harga website profesional di Jambi. Untuk dealer, bimbel, umroh, konstruksi, toko online, dan UMKM. Transparan dan terjangkau.",
  },
};

export default function PricingPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Beranda", path: "/" },
    { name: "Harga", path: "/pricing" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="pt-4 md:pt-20">
        <Pricing />
      </div>
    </>
  );
}
