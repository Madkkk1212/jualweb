export type Project = {
  title: string;
  tag: string;
  category: string;
  desc: string;
  img: string;
  link?: string;
  github?: string;
};

export const projects: Project[] = [
  {
    title: "LUMA Skin",
    tag: "E-Commerce - Skincare",
    category: "E-Commerce",
    desc: "Platform skincare mewah dengan integrasi e-commerce premium, memanjakan pelanggan dengan pengalaman belanja elegan.",
    img: "/images/projects/skincare-luma.png",
    link: "https://skincare-luma.vercel.app/",
  },
  {
    title: "Ayam Geprek Luma",
    tag: "F&B - UMKM",
    category: "F&B",
    desc: "Website pemesanan ayam geprek dengan presentasi yang menggugah selera dan pemilihan menu yang interaktif.",
    img: "/images/projects/ayamgeprek-luma.png",
    link: "https://ayamgeprek-luma.vercel.app/",
  },
  {
    title: "LUMA Culinary",
    tag: "F&B - Premium",
    category: "F&B",
    desc: "Situs eksklusif gastronomy yang mengangkat warisan kuliner menjadi karya seni melalui desain elegan dan minimalis.",
    img: "/images/projects/hiddenmenu-luma.png",
    link: "https://hiddenmenu-luma.vercel.app/",
  },
  {
    title: "Luma Restaurant",
    tag: "F&B - Company Profile",
    category: "F&B",
    desc: "Website restoran premium dengan presentasi menu elegan yang memukau dan fungsionalitas memanjakan tamu.",
    img: "https://iad.microlink.io/87MZCnknhQ9oEgBY2tepvPL4eFUZGDclvEHL4Av0JV6Y5UCrRBZCAAZ1g_XkLtjtdbmmJHv4dKdGT0jpp2BA7A.png",
    link: "https://restaurant-luma.vercel.app/",
  },
  {
    title: "Pencari Kost Luma",
    tag: "Property - Platform",
    category: "Property",
    desc: "Platform pencarian kost modern yang premium. Menawarkan navigasi intuitif untuk pengalaman pencarian hunian terbaik.",
    img: "https://iad.microlink.io/Lij3r7QlASfc7IJ9jXMvMuglhDdyVqjsustl9CNMlTV5DqtYSMJGi6LwA1hgyp2KHlAhPRhYL6_m_k560_K7xw.png",
    link: "https://pencarikost-luma.vercel.app/",
  },
  {
    title: "Kostum Adat Nusantara",
    tag: "Penyewaan Baju Adat",
    category: "Retail",
    desc: "Pusat penyewaan baju adat Jambi terlengkap di Lebak Bandung, Kota Jambi. Koleksi 38 provinsi, jas formal, dan Jasco.",
    img: "https://kostum-adatnusantara.vercel.app/image/bg.jpg",
    link: "https://kostum-adatnusantara.vercel.app",
  },
  {
    title: "Bimbel Luma Admin",
    tag: "Education - Admin Dashboard",
    category: "Education",
    desc: "Dashboard admin modern untuk mengelola tenant bimbingan belajar, branding dinamis, dan kontrol operasional dalam satu sistem terpusat.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://bimbel-admin-luma.vercel.app/",
    link: "https://bimbel-admin-luma.vercel.app/",
  },
  {
    title: "LPJD",
    tag: "Landing Page - Company Profile",
    category: "Company Profile",
    desc: "Landing page profesional untuk mempresentasikan layanan secara ringkas, meyakinkan, dan fokus pada konversi calon klien.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://lpjd.vercel.app/",
    link: "https://lpjd.vercel.app/",
  },
  {
    title: "Bimbel Luma",
    tag: "Education - Platform Bimbel",
    category: "Education",
    desc: "Website bimbingan belajar interaktif dengan alur pemilihan kelas, informasi tutor, dan pengalaman belajar yang ramah untuk siswa dan orang tua.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://bimbel-luma.vercel.app/",
    link: "https://bimbel-luma.vercel.app/",
  },
  {
    title: "BeritaPixel Luma",
    tag: "Media - Tech News",
    category: "Media",
    desc: "Platform berita dan konten teknologi dengan gaya visual editorial yang kuat, navigasi modern, dan fokus pada pengalaman baca yang menarik.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://beritapixel-luma.vercel.app/",
    link: "https://beritapixel-luma.vercel.app/",
  },
  {
    title: "BeritaModern Luma",
    tag: "Media - News Portal",
    category: "Media",
    desc: "Portal berita modern dengan tampilan editorial bersih, struktur konten informatif, dan pengalaman baca yang rapi di berbagai perangkat.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://beritamodern-luma.vercel.app/",
    link: "https://beritamodern-luma.vercel.app/",
  },
  {
    title: "Atuna Umroh Jambi",
    tag: "Travel - Umrah & Haji",
    category: "Travel",
    desc: "Website layanan travel umrah dan haji terpercaya di Jambi dengan paket eksklusif, pelayanan sesuai sunnah, dan pengalaman ibadah yang tak terlupakan.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://atunaumrohjambi-luma.vercel.app/",
    link: "https://atunaumrohjambi-luma.vercel.app/",
  },
  {
    title: "Luma Dealer",
    tag: "Otomotif - Car Dealership",
    category: "Otomotif",
    desc: "Platform dealer mobil premium dengan katalog kendaraan eksklusif, fitur booking test drive, dan pengalaman berbelanja mobil yang mewah dan terpercaya.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://lumadealer.vercel.app/",
    link: "https://lumadealer.vercel.app/",
  },
  {
    title: "Reiwa LMS",
    tag: "Education - LMS",
    category: "Education",
    desc: "Platform pembelajaran bahasa Jepang premium dengan kurikulum terstruktur, materi JLPT interaktif, dan pengalaman belajar modern yang membantu penguasaan Nihongo.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://reiwalms.vercel.app/",
    link: "https://reiwalms.vercel.app/",
  },
  {
    title: "PT Gemilang Aksara Sejahtera",
    tag: "Company Profile - Konstruksi",
    category: "Company Profile",
    desc: "Website profil perusahaan PT. Gemilang Aksara Sejahtera yang menonjolkan layanan arsitektur, desain interior, dan konstruksi profesional dengan portofolio proyek yang kuat.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://ptgas.vercel.app/",
    link: "https://ptgas.vercel.app/",
  },
  {
    title: "Lumahive Rekomendasi",
    tag: "E-Commerce - Affiliate & Kurasi",
    category: "E-Commerce",
    desc: "Platform kurasi produk pilihan terbaik dari berbagai kategori—fashion, kuliner, dan kecantikan—membantu konsumen belanja lebih cerdas dan hemat.",
    img: "https://image.thum.io/get/width/1200/noanimate/https://www.rekomendasi-luma.my.id/",
    link: "https://www.rekomendasi-luma.my.id/",
  },
];

