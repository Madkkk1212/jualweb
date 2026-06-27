export type Lang = "id" | "en";

// ─── Translation Dictionary ──────────────────────────────────────────────────
const translations = {
  id: {
    // ── Navbar ──────────────────────────────────────────────────────────────
    navbar: {
      home: "Beranda",
      portfolio: "Portofolio",
      services: "Solusi",
      pricing: "Harga",
      process: "Proses",
      faq: "FAQ",
      contact: "Kontak",
      cta: "Chat WhatsApp",
    },

    // ── Footer ──────────────────────────────────────────────────────────────
    footer: {
      tagline:
        "Partner pembuatan website yang membantu bisnis terlihat lebih profesional, lebih dipercaya, dan lebih siap menerima order dari calon pelanggan.",
      servicesHeading: "Layanan",
      contactHeading: "Kontak Kami",
      location: "Jambi, Indonesia",
      copyright: "Membantu Pertumbuhan Bisnis Anda.",
      privacy: "Kebijakan Privasi",
      terms: "Ketentuan Layanan",
      chatWa: "Chat WhatsApp",
    },

    // ── Bottom Nav ───────────────────────────────────────────────────────────
    bottomNav: {
      home: "Beranda",
      services: "Layanan",
      pricing: "Harga",
      portfolio: "Portofolio",
      instagram: "Instagram",
    },

    // ── Hero ─────────────────────────────────────────────────────────────────
    hero: {
      badge: "LAYANAN PEMBUATAN WEBSITE",
      headline1: "Layanan Pembuatan",
      headline2: "Website",
      headline3: "Profesional",
      headline4: "yang bikin bisnis lebih",
      headline5: "dipercaya.",
      seoBadge1: "SEO Friendly",
      seoBadge2: "✦ Tampil di Google",
      desc: "Kami membantu UMKM dan bisnis tampil lebih profesional lewat website cepat, desain premium, struktur SEO friendly, dan alur yang dibuat untuk meningkatkan peluang chat, order, dan closing.",
      cta1: "Lihat Portofolio",
      cta2: "Konsultasi Gratis",
      robotMsg: "Hi, saya Luma! Yuk buat website yang mudah ditemukan di Google 👋",
    },

    // ── Features ─────────────────────────────────────────────────────────────
    features: {
      badge: "Keunggulan Kami",
      heading: "Kenapa",
      headingHighlight: "LumaSpace?",
      subtitle:
        "Setiap detail dioptimasi untuk satu tujuan: membuat bisnis Anda lebih dipercaya dan lebih mudah mendapatkan pelanggan baru.",
      items: [
        {
          title: "Akses Instan (<1 Detik)",
          desc: "Pengunjung tidak suka menunggu. Website lambat membuat calon pembeli kabur ke kompetitor. Kami mengoptimasi kecepatan akses hingga milidetik untuk memastikan konversi maksimal tanpa ada prospek yang hilang.",
        },
        {
          title: "Keamanan Standar Bank",
          desc: "Lindungi reputasi bisnis Anda dari ancaman hacker dan malware. Dilengkapi dengan SSL otomatis, proteksi DDoS tangguh dari Vercel, dan enkripsi data berlapis agar transaksi pelanggan dijamin 100% aman.",
        },
        {
          title: "Dominasi Halaman 1 Google",
          desc: "Website indah tidak ada gunanya jika tidak ditemukan. Kami menerapkan struktur SEO terbaik, kode semantik, dan skema metadata presisi agar bisnis Anda mudah merajai hasil pencarian Google tanpa iklan mahal.",
        },
        {
          title: "Sistem Closing Otomatis",
          desc: "Ubah pengunjung pasif menjadi pembeli aktif. Integrasi tombol WhatsApp interaktif dan alur konversi instan kami rancang khusus untuk mempercepat keputusan beli pelanggan langsung ke WhatsApp Anda.",
        },
        {
          title: "Desain Eksklusif Anti-Template",
          desc: "Website murah menggunakan template pasaran yang terlihat murahan dan menurunkan rasa percaya. Kami merancang desain kustom 100% dari nol untuk mencerminkan kredibilitas dan kelas premium bisnis Anda.",
        },
      ],
    },

    // ── Testimonials ─────────────────────────────────────────────────────────
    testimonials: {
      badge: "Testimoni Klien",
      heading: "Apa Kata",
      headingHighlight: "Klien Kami.",
      subtitle:
        "Testimoni dari pemilik bisnis yang ingin tampil lebih meyakinkan, lebih profesional, dan lebih siap bersaing secara digital.",
      reviews: [
        {
          name: "Rina Amelia",
          role: "Owner Brand Skincare",
          content:
            "Website yang dibuat benar-benar menaikkan citra brand kami. Saat customer buka, tampilannya langsung terasa premium dan lebih meyakinkan untuk order.",
        },
        {
          name: "Budi Santoso",
          role: "Owner Kuliner",
          content:
            "Setelah pakai website ini, pelanggan lebih gampang lihat menu dan langsung chat untuk pesan. Tampilannya juga jauh lebih profesional daripada cuma pakai katalog chat.",
        },
        {
          name: "Dewi Kartika",
          role: "Founder Catering",
          content:
            "Saya suka karena prosesnya cepat, hasilnya rapi, dan copy websitenya terasa menjual. Banyak calon klien bilang usaha kami terlihat jauh lebih terpercaya.",
        },
        {
          name: "David Chen",
          role: "Manager Restaurant",
          content:
            "Desain website yang dibuat sangat elegan dan premium. Sebelum datang ke restoran, tamu sudah dapat kesan kalau brand kami serius dan berkualitas.",
        },
        {
          name: "Ahmad Rizky",
          role: "Owner Platform Properti",
          content:
            "Tampilan website modern, cepat, dan enak dipakai. Yang paling terasa, calon pengguna lebih percaya karena platform kami terlihat rapi dan profesional.",
        },
        {
          name: "Rudianto",
          role: "Owner UMKM Jambi",
          content:
            "Website buatan LumaSpace sangat membantu closing. Dari HP pelanggan pun tetap cepat dibuka dan tampilannya bikin usaha kami terlihat lebih serius.",
        },
        {
          name: "Maya Putri",
          role: "Founder Retail",
          content:
            "Sangat profesional. Katalog produk kami sekarang terlihat jauh lebih berkelas dibanding sebelumnya, jadi lebih mudah dipakai saat promosi ke customer.",
        },
        {
          name: "Andi Saputra",
          role: "Direktur Perusahaan",
          content:
            "Prosesnya cepat dan transparan. Timnya paham bagaimana membuat website yang tidak hanya bagus, tapi juga mendukung branding perusahaan di mata calon klien.",
        },
        {
          name: "Siti Rahma",
          role: "Owner Rental Busana",
          content:
            "Galeri produk jadi jauh lebih menarik. Banyak pelanggan bilang websitenya enak dilihat dan membuat mereka lebih yakin untuk sewa ke tempat kami.",
        },
      ],
    },

    // ── Services ─────────────────────────────────────────────────────────────
    services: {
      badge: "Solusi Digital",
      heading: "Solusi yang",
      headingHighlight: "Tepat Sasaran.",
      subtitle:
        "Kami tidak hanya membuat website, kami membangun infrastruktur digital yang dirancang untuk meningkatkan kredibilitas dan profitabilitas bisnis Anda.",
      items: [
        {
          title: "Landing Page Konversi Tinggi",
          desc: "Halaman promosi tunggal yang dirancang khusus untuk mengubah pengunjung menjadi pembeli. Fokus pada psikologi desain dan alur konversi yang terstruktur.",
          features: ["Copywriting Persuasif", "Mobile Optimized", "Integrasi Pixel & Analytics", "WhatsApp CRM Link"],
        },
        {
          title: "Profil Perusahaan Profesional",
          desc: "Bangun otoritas dan kepercayaan klien dengan website profil perusahaan yang elegan, informatif, dan mencerminkan identitas brand Anda.",
          features: ["Custom Branding", "Halaman Layanan Lengkap", "Profil Tim & Portfolio", "SEO Page Structure"],
        },
        {
          title: "Toko Online Modern (E-Commerce)",
          desc: "Toko online modern dengan pengelolaan produk yang mudah, sistem keranjang belanja, dan integrasi pengiriman otomatis untuk bisnis Anda.",
          features: ["Katalog Produk Dinamis", "Sistem Checkout Simpel", "Payment Gateway Ready", "Dashboard Penjualan"],
        },
        {
          title: "Ekosistem & Sistem Kustom",
          desc: "Solusi platform khusus untuk edukasi, media berita, atau manajemen internal bisnis yang membutuhkan sistem database dan interaksi kompleks.",
          features: ["Sistem CMS Custom", "Database Management", "User Authentication", "Scalability Ready"],
        },
      ],
    },

    // ── Process ──────────────────────────────────────────────────────────────
    process: {
      badge: "Alur Kerja Kami",
      heading: "Proses yang",
      headingHighlight: "Terstruktur.",
      subtitle:
        "Dari ide hingga eksekusi, setiap langkah dilakukan dengan ketelitian tinggi untuk memastikan kualitas terbaik bagi bisnis Anda.",
      steps: [
        {
          title: "Diskusi & Strategi",
          desc: "Kami menggali visi bisnis Anda, menganalisis kompetitor, dan menentukan strategi digital yang paling efektif untuk target market Anda.",
        },
        {
          title: "Desain UI/UX Eksklusif",
          desc: "Pembuatan desain UI/UX eksklusif yang tidak hanya cantik, tapi juga fungsional dan fokus pada pengalaman pengguna (User Experience).",
        },
        {
          title: "Coding & Development",
          desc: "Proses coding menggunakan Next.js & Tailwind Core untuk memastikan website ringan, cepat, dan aman dari kerentanan digital.",
        },
        {
          title: "Peluncuran & Optimasi",
          desc: "Peluncuran website ke server global disertai optimasi SEO dasar dan dukungan teknis untuk memastikan performa awal yang sempurna.",
        },
      ],
    },

    // ── Portfolio ─────────────────────────────────────────────────────────────
    portfolio: {
      heading: "Proyek",
      headingHighlight: "Pilihan.",
      subtitle:
        "Eksplorasi beberapa proyek pilihan yang telah kami bantu kembangkan dengan standar kualitas premium.",
      viewAll: "Lihat Semua Portofolio",
    },

    // ── Pricing ──────────────────────────────────────────────────────────────
    pricing: {
      badge: "Investasi Cerdas untuk Bisnis",
      heading: "Mulai dari",
      headingHighlight: "Harga Jujur.",
      subtitle:
        "Tanpa biaya bulanan tersembunyi. Miliki aset digital Anda sepenuhnya dengan performa yang maksimal sejak hari pertama.",
      mostRecommended: "Paling Rekomen",
      period: "Sekali Bayar",
      periodEstimate: "Estimasi",
      cta: "Pilih Paket",
      guarantee: "Investasi Sekali, Miliki Selamanya.",
      guaranteeDesc:
        "Kami tidak mengikat Anda dengan biaya langganan platform yang mahal. Website Anda adalah milik Anda sepenuhnya.",
      guaranteeCta: "Gratis Konsultasi",
      plans: [
        {
          name: "Paket Dasar",
          desc: "Solusi instan untuk UMKM yang ingin mulai go-digital dengan anggaran hemat.",
          features: [
            "1 Halaman (Single Page)",
            "Desain Mobile Friendly",
            "WhatsApp Click-to-Chat",
            "Domain namaanda.vercel.app",
            "Gratis Hosting Selamanya",
            "Maintenance 1 Bulan",
          ],
        },
        {
          name: "Landing Page Pro",
          desc: "Didesain khusus untuk konversi tinggi. Cocok untuk iklan Sosmed & Google Ads.",
          features: [
            "1 Halaman Premium",
            "Copywriting Menjual",
            "SEO Dasar Terpasang",
            "Desain Eksklusif (Custom)",
            "Integrasi Pixel/Analytics",
            "Maintenance 2 Bulan",
            "Prioritas Support",
          ],
        },
        {
          name: "Profil Perusahaan",
          desc: "Bangun kredibilitas perusahaan dengan struktur informasi yang lengkap & elegan.",
          features: [
            "Hingga 5 Halaman Utama",
            "Struktur Navigasi Profesional",
            "Profil Tim & Layanan",
            "Form Kontak & Map",
            "Optimasi Kecepatan",
            "Maintenance 3 Bulan",
          ],
        },
        {
          name: "Website Kustom",
          desc: "Solusi khusus untuk platform e-commerce, edukasi, atau kebutuhan skala besar.",
          features: [
            "Halaman Tak Terbatas",
            "Dashboard Admin (CMS)",
            "Integrasi Payment Gateway",
            "Sistem Database Custom",
            "Optimasi SEO Lanjutan",
            "Support Selamanya",
          ],
        },
      ],
    },

    // ── FAQ ──────────────────────────────────────────────────────────────────
    faq: {
      badge: "Tanya Jawab",
      heading: "Ada",
      headingHighlight: "Pertanyaan?",
      subtitle:
        "Temukan jawaban untuk pertanyaan yang paling sering diajukan mengenai layanan kami.",
      stillHaveQ: "Masih punya pertanyaan lain?",
      stillHaveQDesc: "Tim kami siap membantu menjawab keraguan Anda secara langsung via WhatsApp.",
      askWa: "Tanya via WhatsApp",
      items: [
        {
          q: "Berapa lama waktu pengerjaan website?",
          a: "Rata-rata pengerjaan memakan waktu 3 hingga 7 hari kerja, tergantung pada kompleksitas desain dan fitur yang dibutuhkan. Kami memprioritaskan kualitas tanpa mengorbankan kecepatan.",
        },
        {
          q: "Apakah saya mendapatkan domain dan hosting?",
          a: "Ya, seluruh paket kami sudah termasuk hosting gratis selamanya melalui Vercel. Untuk domain kustom seperti .com atau .id tersedia gratis pada paket tertentu selama tahun pertama.",
        },
        {
          q: "Bagaimana jika ada kesalahan setelah website online?",
          a: "Kami memberikan garansi perbaikan dan pemeliharaan teknis gratis selama 1 bulan setelah peluncuran agar website tetap berjalan dengan baik.",
        },
        {
          q: "Dapatkah saya melakukan revisi desain?",
          a: "Tentu. Kami menyediakan fase revisi untuk menyesuaikan tampilan website dengan identitas bisnis Anda.",
        },
        {
          q: "Apakah website saya SEO friendly?",
          a: "Ya. Website dibangun dengan Next.js dan struktur yang ramah mesin pencari agar lebih mudah diindeks Google dan mendukung performa SEO dasar.",
        },
        {
          q: "Berapa harga jasa pembuatan website di Jambi?",
          a: "Harga jasa pembuatan website di LumaSpace Jambi mulai dari Rp299.000 untuk Landing Page, Rp799.000 untuk Company Profile, dan Rp1.499.000 untuk Paket Premium & E-Commerce. Semua paket sudah termasuk hosting gratis selamanya.",
        },
        {
          q: "Jasa website apa saja yang tersedia di Jambi?",
          a: "LumaSpace di Jambi menyediakan jasa pembuatan website dealer mobil, website bimbingan belajar (bimbel), website travel umroh & haji, website konstruksi & kontraktor, toko online e-commerce, company profile perusahaan, dan landing page UMKM.",
        },
        {
          q: "Bagaimana cara memesan website di LumaSpace?",
          a: "Cara pesan website di LumaSpace sangat mudah: 1) Hubungi kami via WhatsApp di 0895-1461-8737 untuk konsultasi gratis, 2) Pilih paket yang sesuai, 3) Kirim materi konten bisnis Anda, 4) Kami proses dalam 3-7 hari, 5) Website Anda langsung live dan bisa diakses.",
        },
        {
          q: "Apakah ada biaya tambahan setelah website jadi?",
          a: "Tidak ada biaya tersembunyi. Hosting sudah gratis selamanya. Biaya tambahan hanya jika Anda ingin perpanjangan domain kustom di tahun kedua (sekitar Rp150rb-300rb/tahun) atau menambah fitur baru.",
        },
        {
          q: "Apakah website bisa diupdate sendiri setelah jadi?",
          a: "Tergantung paket yang dipilih. Paket tertentu dilengkapi panel admin sederhana untuk update konten sendiri. Untuk update konten besar, Anda bisa hubungi tim kami.",
        },
        {
          q: "Apakah LumaSpace melayani klien di luar Jambi?",
          a: "Ya, kami melayani klien dari seluruh Indonesia secara online. Proses komunikasi, pengerjaan, dan serah terima dilakukan via WhatsApp dan email tanpa perlu tatap muka.",
        },
      ],
    },

    // ── ContactCTA ───────────────────────────────────────────────────────────
    contactCta: {
      onlineNow: "Online Sekarang",
      heading: "Optimasi Website Untuk",
      headingHighlight: "Mendatangkan Calon Pembeli",
      trust1: "Respon < 10 Menit",
      trust2: "Konsultasi Gratis",
      trust3: "Garansi Profesional",
      cta1: "Chat WhatsApp Sekarang",
      cta2: "IG Portfolio @lumaspace.web.id",
      footnote: "Lebih dari 40+ Bisnis telah mempercayakan kehadiran digital mereka kepada kami.",
    },

    // ── ConversionStrip ──────────────────────────────────────────────────────
    conversionStrip: {
      sectionLabel: "Closing Booster",
      heading: "Semakin cepat calon pelanggan yakin,",
      headingHighlight: " semakin besar peluang mereka chat.",
      desc: "Karena itu halaman ini kami arahkan untuk satu tujuan utama: membuat bisnis Anda terlihat profesional, lalu mendorong pengunjung mengambil tindakan lewat WhatsApp.",
      items: [
        {
          title: "Respon Cepat",
          desc: "Cocok untuk calon klien yang ingin langsung tanya harga dan kebutuhan website.",
        },
        {
          title: "Lebih Meyakinkan",
          desc: "Copy, desain, dan struktur halaman dibuat untuk menaikkan trust bisnis Anda.",
        },
        {
          title: "Langsung Konsultasi",
          desc: "Tidak perlu ribet. Tinggal chat WhatsApp, jelaskan kebutuhan, lalu kami bantu arahkan paketnya.",
        },
      ],
      cta: "Chat WhatsApp Sekarang",
    },

    // ── Contact Page ─────────────────────────────────────────────────────────
    contact: {
      heading: "Mari Kita",
      headingHighlight: "Bicara.",
      subtitle:
        "Kami siap membantu menjawab semua keraguan Anda. Pilih jalur komunikasi yang paling nyaman bagi Anda.",
      locationLabel: "Lokasi",
      formHeading: "Kirim Pesan",
      formSubtitle: "Isi form di bawah dan kami akan segera menghubungi Anda.",
      labelName: "Nama Lengkap",
      labelWa: "Nomor WhatsApp",
      labelIg: "Instagram",
      labelIgOptional: "(opsional)",
      labelMessage: "Pesan / Kebutuhan",
      placeholderName: "Contoh: Budi Santoso",
      placeholderWa: "Contoh: 08xxxxxxxxxx",
      placeholderIg: "username_instagram",
      placeholderMessage: "Ceritakan kebutuhan website Anda...",
      submit: "Kirim Pesan",
      sending: "Mengirim...",
      successTitle: "Pesan Terkirim!",
      successDesc: "Terima kasih! Kami akan menghubungi Anda segera.",
      sendAnother: "Kirim pesan lagi",
      errorRequired: "Nama, WhatsApp, dan pesan wajib diisi.",
      errorNetwork: "Terjadi kesalahan jaringan. Silakan coba lagi.",
      errorServer: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
    },

    // ── Language Switcher ────────────────────────────────────────────────────
    lang: {
      switch: "EN",
      current: "ID",
      label: "Ganti Bahasa",
    },

    // ── TechStack ────────────────────────────────────────────────────────────
    techStack: {
      badge: "LAYANAN PEMBUATAN WEBSITE",
      heading: "Website Cepat.",
      headingHighlight: "Hasil Maksimal.",
      subtitle:
        "Kami tidak menggunakan template murahan. Setiap baris kode dirancang secara khusus untuk memastikan website Anda bukan hanya cantik, tapi juga mesin pertumbuhan bisnis.",
      systemRunning: "SISTEM BERJALAN OPTIMAL — 100%",
      feats: [
        { title: "Sangat Cepat", desc: "Optimasi khusus untuk waktu muat instan." },
        { title: "SEO Terpadu", desc: "Struktur pencarian agar bisnis unggul di Google." },
        { title: "Keamanan Lapis", desc: "Enkripsi modern dan proteksi data terbaik." },
        { title: "Sistem Tumbuh", desc: "Arsitektur yang mampu berkembang bersama bisnis." },
      ],
      techRows: [
        { label: "Antarmuka", value: "Sistem Modern" },
        { label: "Visual", value: "Desain Adaptif" },
        { label: "Cloud", value: "Server Global" },
        { label: "Interaksi", value: "Animasi Halus" },
      ],
    },

    // ── Portfolio Page ────────────────────────────────────────────────────────
    portfolioPage: {
      badge: "Template Website",
      heading: "Template Pilihan.",
      subtitle:
        "Jelajahi koleksi template website untuk berbagai jenis bisnis. Setiap template dapat dikustomisasi mulai dari warna, konten, fitur, hingga identitas visual agar sesuai dengan kebutuhan brand Anda. Ini hanya sebuah contoh jika mau lebih custom bisa langsung ke admin.",
      filterHeading: "Kategori Filter",
      all: "Semua",
      empty: "Belum ada portofolio di kategori ini.",
      categories: {
        "e-commerce": "E-Commerce",
        "f&b": "F&B / Kuliner",
        "property": "Properti",
        "retail": "Ritel",
        "education": "Edukasi",
        "company profile": "Profil Perusahaan",
        "media": "Media Portal",
        "travel umroh": "Travel & Umroh",
        "otomotif": "Otomotif",
        "landing page": "Landing Page",
        "toko online": "Toko Online",
        "lainnya": "Lainnya",
      } as Record<string, string>,
      projects: {} as Record<string, { tag: string; desc: string }>,
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ENGLISH
  // ════════════════════════════════════════════════════════════════════════════
  en: {
    // ── Navbar ──────────────────────────────────────────────────────────────
    navbar: {
      home: "Home",
      portfolio: "Portfolio",
      services: "Solutions",
      pricing: "Pricing",
      process: "Process",
      faq: "FAQ",
      contact: "Contact",
      cta: "Chat WhatsApp",
    },

    // ── Footer ──────────────────────────────────────────────────────────────
    footer: {
      tagline:
        "Your website partner helping businesses look more professional, more trusted, and more ready to receive orders from potential customers.",
      servicesHeading: "Services",
      contactHeading: "Contact Us",
      location: "Jambi, Indonesia",
      copyright: "Helping Your Business Grow.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      chatWa: "Chat WhatsApp",
    },

    // ── Bottom Nav ───────────────────────────────────────────────────────────
    bottomNav: {
      home: "Home",
      services: "Services",
      pricing: "Pricing",
      portfolio: "Portfolio",
      instagram: "Instagram",
    },

    // ── Hero ─────────────────────────────────────────────────────────────────
    hero: {
      badge: "WEBSITE CREATION SERVICE",
      headline1: "Professional",
      headline2: "Website",
      headline3: "Creation",
      headline4: "that makes your business more",
      headline5: "trusted.",
      seoBadge1: "SEO Friendly",
      seoBadge2: "✦ Rank on Google",
      desc: "We help SMEs and businesses look more professional through fast websites, premium design, SEO-friendly structure, and a flow built to increase chat, order, and closing opportunities.",
      cta1: "View Portfolio",
      cta2: "Free Consultation",
      robotMsg: "Hi, I'm Luma! Let's build a website that's easy to find on Google 👋",
    },

    // ── Features ─────────────────────────────────────────────────────────────
    features: {
      badge: "Our Advantages",
      heading: "Why",
      headingHighlight: "LumaSpace?",
      subtitle:
        "Every detail is optimized for one goal: making your business more trusted and easier to attract new customers.",
      items: [
        {
          title: "Instant Access (<1 Second)",
          desc: "Visitors don't like to wait. A slow website drives potential buyers to competitors. We optimize loading speed down to milliseconds to ensure maximum conversion with no lost prospects.",
        },
        {
          title: "Bank-Grade Security",
          desc: "Protect your business reputation from hackers and malware. Equipped with automatic SSL, robust DDoS protection from Vercel, and multi-layer data encryption to keep every customer transaction 100% safe.",
        },
        {
          title: "Dominate Google Page 1",
          desc: "A beautiful website is useless if it can't be found. We apply the best SEO structure, semantic code, and precise metadata schema so your business can easily top Google search results without expensive ads.",
        },
        {
          title: "Automated Closing System",
          desc: "Turn passive visitors into active buyers. Our interactive WhatsApp button integration and instant conversion flow are designed to accelerate purchase decisions directly to your WhatsApp.",
        },
        {
          title: "Exclusive Anti-Template Design",
          desc: "Cheap websites use generic market templates that look cheap and reduce trust. We design 100% custom designs from scratch to reflect the credibility and premium class of your business.",
        },
      ],
    },

    // ── Testimonials ─────────────────────────────────────────────────────────
    testimonials: {
      badge: "Client Testimonials",
      heading: "What Our",
      headingHighlight: "Clients Say.",
      subtitle:
        "Testimonials from business owners who want to appear more convincing, more professional, and more ready to compete digitally.",
      reviews: [
        {
          name: "Rina Amelia",
          role: "Skincare Brand Owner",
          content:
            "The website truly elevated our brand image. When customers open it, it immediately feels premium and more convincing to order from.",
        },
        {
          name: "Budi Santoso",
          role: "Culinary Business Owner",
          content:
            "After using this website, customers can more easily see the menu and chat directly to order. The look is also much more professional than just using a chat catalog.",
        },
        {
          name: "Dewi Kartika",
          role: "Catering Founder",
          content:
            "I love how fast the process was, the results are clean, and the website copy feels like it sells. Many potential clients say our business looks far more trustworthy.",
        },
        {
          name: "David Chen",
          role: "Restaurant Manager",
          content:
            "The website design is very elegant and premium. Before visiting the restaurant, guests already get the impression that our brand is serious and high quality.",
        },
        {
          name: "Ahmad Rizky",
          role: "Property Platform Owner",
          content:
            "The website looks modern, fast, and easy to use. The biggest impact is that potential users trust us more because our platform looks neat and professional.",
        },
        {
          name: "Rudianto",
          role: "SME Owner, Jambi",
          content:
            "LumaSpace's website is very helpful for closing deals. It loads fast even on mobile and the design makes our business look more serious.",
        },
        {
          name: "Maya Putri",
          role: "Retail Founder",
          content:
            "Very professional. Our product catalog now looks far more premium than before, making it easier to use when promoting to customers.",
        },
        {
          name: "Andi Saputra",
          role: "Company Director",
          content:
            "The process was fast and transparent. The team understands how to build a website that not only looks great but also supports company branding in the eyes of potential clients.",
        },
        {
          name: "Siti Rahma",
          role: "Clothing Rental Owner",
          content:
            "The product gallery is so much more attractive now. Many customers say the website is nice to look at and makes them more confident to rent from us.",
        },
      ],
    },

    // ── Services ─────────────────────────────────────────────────────────────
    services: {
      badge: "Digital Solutions",
      heading: "Solutions That",
      headingHighlight: "Hit the Mark.",
      subtitle:
        "We don't just build websites — we build digital infrastructure designed to increase your business's credibility and profitability.",
      items: [
        {
          title: "High-Conversion Landing Page",
          desc: "A single promotional page designed specifically to turn visitors into buyers, focused on design psychology and a structured conversion flow.",
          features: ["Persuasive Copywriting", "Mobile Optimized", "Pixel & Analytics Integration", "WhatsApp CRM Link"],
        },
        {
          title: "Professional Company Profile",
          desc: "Build authority and client trust with an elegant, informative company profile website that reflects your brand identity.",
          features: ["Custom Branding", "Full Services Page", "Team & Portfolio Profile", "SEO Page Structure"],
        },
        {
          title: "Modern Online Store (E-Commerce)",
          desc: "A modern online store with easy product management, a shopping cart system, and automatic shipping integration for your business.",
          features: ["Dynamic Product Catalog", "Simple Checkout System", "Payment Gateway Ready", "Sales Dashboard"],
        },
        {
          title: "Ecosystem & Custom Systems",
          desc: "Specialized platform solutions for education, news media, or business internal management requiring database systems and complex interactions.",
          features: ["Custom CMS System", "Database Management", "User Authentication", "Scalability Ready"],
        },
      ],
    },

    // ── Process ──────────────────────────────────────────────────────────────
    process: {
      badge: "Our Workflow",
      heading: "A Structured",
      headingHighlight: "Process.",
      subtitle:
        "From idea to execution, every step is carried out with high precision to ensure the best quality for your business.",
      steps: [
        {
          title: "Discussion & Strategy",
          desc: "We explore your business vision, analyze competitors, and determine the most effective digital strategy for your target market.",
        },
        {
          title: "Exclusive UI/UX Design",
          desc: "Creating exclusive UI/UX design that is not only beautiful, but also functional and focused on User Experience.",
        },
        {
          title: "Coding & Development",
          desc: "Coding process using Next.js & Tailwind Core to ensure the website is lightweight, fast, and secure from digital vulnerabilities.",
        },
        {
          title: "Launch & Optimization",
          desc: "Launching the website to global servers with basic SEO optimization and technical support to ensure a perfect initial performance.",
        },
      ],
    },

    // ── Portfolio ─────────────────────────────────────────────────────────────
    portfolio: {
      heading: "Featured",
      headingHighlight: "Projects.",
      subtitle:
        "Explore some of our selected projects that we have helped develop with premium quality standards.",
      viewAll: "View All Portfolio",
    },

    // ── Pricing ──────────────────────────────────────────────────────────────
    pricing: {
      badge: "Smart Investment for Business",
      heading: "Starting at",
      headingHighlight: "Honest Pricing.",
      subtitle:
        "No hidden monthly fees. Own your digital assets entirely with maximum performance from day one.",
      mostRecommended: "Most Recommended",
      period: "One-Time Payment",
      periodEstimate: "Estimate",
      cta: "Choose Plan",
      guarantee: "Invest Once, Own Forever.",
      guaranteeDesc:
        "We don't lock you into expensive platform subscription fees. Your website is entirely yours.",
      guaranteeCta: "Free Consultation",
      plans: [
        {
          name: "Basic Package",
          desc: "An instant solution for SMEs who want to go digital on a tight budget.",
          features: [
            "1 Page (Single Page)",
            "Mobile Friendly Design",
            "WhatsApp Click-to-Chat",
            "Domain yourname.vercel.app",
            "Free Hosting Forever",
            "1 Month Maintenance",
          ],
        },
        {
          name: "Landing Page Pro",
          desc: "Specially designed for high conversion. Perfect for social media ads & Google Ads.",
          features: [
            "1 Premium Page",
            "Sales Copywriting",
            "Basic SEO Installed",
            "Exclusive Design (Custom)",
            "Pixel/Analytics Integration",
            "2 Months Maintenance",
            "Priority Support",
          ],
        },
        {
          name: "Company Profile",
          desc: "Build company credibility with a complete & elegant information structure.",
          features: [
            "Up to 5 Main Pages",
            "Professional Navigation Structure",
            "Team & Services Profile",
            "Contact Form & Map",
            "Speed Optimization",
            "3 Months Maintenance",
          ],
        },
        {
          name: "Custom Website",
          desc: "Special solution for e-commerce platforms, education, or large-scale needs.",
          features: [
            "Unlimited Pages",
            "Admin Dashboard (CMS)",
            "Payment Gateway Integration",
            "Custom Database System",
            "Advanced SEO Optimization",
            "Lifetime Support",
          ],
        },
      ],
    },

    // ── FAQ ──────────────────────────────────────────────────────────────────
    faq: {
      badge: "Q&A",
      heading: "Got",
      headingHighlight: "Questions?",
      subtitle:
        "Find answers to the most frequently asked questions about our services.",
      stillHaveQ: "Still have more questions?",
      stillHaveQDesc: "Our team is ready to help answer your doubts directly via WhatsApp.",
      askWa: "Ask via WhatsApp",
      items: [
        {
          q: "How long does website development take?",
          a: "Development typically takes 3 to 7 business days, depending on the complexity of the design and features required. We prioritize quality without sacrificing speed.",
        },
        {
          q: "Do I get a domain and hosting?",
          a: "Yes, all our packages include free lifetime hosting through Vercel. Custom domains like .com or .id are available free for certain packages during the first year.",
        },
        {
          q: "What if there are issues after the website goes live?",
          a: "We provide free bug fixes and technical maintenance for 1 month after launch to keep the website running smoothly.",
        },
        {
          q: "Can I request design revisions?",
          a: "Absolutely. We provide a revision phase to align the website's appearance with your business identity.",
        },
        {
          q: "Is my website SEO friendly?",
          a: "Yes. The website is built with Next.js and a search engine-friendly structure to be more easily indexed by Google and support basic SEO performance.",
        },
        {
          q: "How much does website development cost in Jambi?",
          a: "Website development at LumaSpace Jambi starts from Rp299,000 for a Landing Page, Rp799,000 for a Company Profile, and Rp1,499,000 for Premium & E-Commerce packages. All packages include free lifetime hosting.",
        },
        {
          q: "What website services are available in Jambi?",
          a: "LumaSpace in Jambi provides car dealer websites, tutoring center websites, Umrah & Hajj travel websites, construction & contractor websites, e-commerce online stores, company profiles, and SME landing pages.",
        },
        {
          q: "How do I order a website from LumaSpace?",
          a: "Ordering from LumaSpace is simple: 1) Contact us via WhatsApp at 0895-1461-8737 for a free consultation, 2) Choose a suitable package, 3) Submit your business content, 4) We process it in 3-7 days, 5) Your website goes live and is accessible.",
        },
        {
          q: "Are there any additional costs after the website is done?",
          a: "No hidden fees. Hosting is free forever. Additional costs only apply if you want to renew a custom domain in the second year (around Rp150k-300k/year) or add new features.",
        },
        {
          q: "Can I update the website myself after it's done?",
          a: "It depends on the package chosen. Certain packages include a simple admin panel for self-managed content updates. For major content updates, you can contact our team.",
        },
        {
          q: "Does LumaSpace serve clients outside Jambi?",
          a: "Yes, we serve clients from all over Indonesia online. Communication, development, and handover are done via WhatsApp and email without the need for in-person meetings.",
        },
      ],
    },

    // ── ContactCTA ───────────────────────────────────────────────────────────
    contactCta: {
      onlineNow: "Online Now",
      heading: "Optimize Your Website To",
      headingHighlight: "Attract Potential Buyers",
      trust1: "Response < 10 Min",
      trust2: "Free Consultation",
      trust3: "Professional Guarantee",
      cta1: "Chat WhatsApp Now",
      cta2: "IG Portfolio @lumaspace.web.id",
      footnote: "Over 40+ businesses have trusted their digital presence to us.",
    },

    // ── ConversionStrip ──────────────────────────────────────────────────────
    conversionStrip: {
      sectionLabel: "Closing Booster",
      heading: "The faster potential customers are convinced,",
      headingHighlight: " the greater their chance to chat.",
      desc: "That's why this page is directed toward one main goal: making your business look professional, then pushing visitors to take action via WhatsApp.",
      items: [
        {
          title: "Fast Response",
          desc: "Perfect for potential clients who want to immediately ask about pricing and website needs.",
        },
        {
          title: "More Convincing",
          desc: "Copy, design, and page structure are built to boost trust in your business.",
        },
        {
          title: "Direct Consultation",
          desc: "No hassle. Just chat on WhatsApp, explain your needs, and we'll help guide you to the right package.",
        },
      ],
      cta: "Chat WhatsApp Now",
    },

    // ── Contact Page ─────────────────────────────────────────────────────────
    contact: {
      heading: "Let's",
      headingHighlight: "Talk.",
      subtitle:
        "We're ready to help answer all your questions. Choose the communication channel that's most comfortable for you.",
      locationLabel: "Location",
      formHeading: "Send a Message",
      formSubtitle: "Fill out the form below and we'll get in touch with you shortly.",
      labelName: "Full Name",
      labelWa: "WhatsApp Number",
      labelIg: "Instagram",
      labelIgOptional: "(optional)",
      labelMessage: "Message / Needs",
      placeholderName: "e.g. John Smith",
      placeholderWa: "e.g. 08xxxxxxxxxx",
      placeholderIg: "instagram_username",
      placeholderMessage: "Tell us about your website needs...",
      submit: "Send Message",
      sending: "Sending...",
      successTitle: "Message Sent!",
      successDesc: "Thank you! We'll get in touch with you shortly.",
      sendAnother: "Send another message",
      errorRequired: "Name, WhatsApp, and message are required.",
      errorNetwork: "A network error occurred. Please try again.",
      errorServer: "An error occurred while sending your message. Please try again.",
    },

    // ── Language Switcher ────────────────────────────────────────────────────
    lang: {
      switch: "ID",
      current: "EN",
      label: "Switch Language",
    },

    // ── TechStack ────────────────────────────────────────────────────────────
    techStack: {
      badge: "WEBSITE CREATION SERVICE",
      heading: "Fast Website.",
      headingHighlight: "Maximum Results.",
      subtitle:
        "We don't use cheap templates. Every line of code is crafted specifically to ensure your website is not just beautiful, but also a business growth engine.",
      systemRunning: "SYSTEM RUNNING OPTIMAL — 100%",
      feats: [
        { title: "Ultra Fast", desc: "Specially optimized for instant load times." },
        { title: "Built-in SEO", desc: "Search structure to make your business dominate Google." },
        { title: "Layered Security", desc: "Modern encryption and top-tier data protection." },
        { title: "Scalable System", desc: "Architecture that grows along with your business." },
      ],
      techRows: [
        { label: "Interface", value: "Modern System" },
        { label: "Visual", value: "Adaptive Design" },
        { label: "Cloud", value: "Global Server" },
        { label: "Interaction", value: "Smooth Animation" },
      ],
    },

    // ── Portfolio Page ────────────────────────────────────────────────────────
    portfolioPage: {
      badge: "Website Templates",
      heading: "Featured Templates.",
      subtitle:
        "Explore our collection of website templates for various types of businesses. Each template can be customized from colors, content, features, to visual identity to suit your brand's needs. These are just examples — for more custom work, contact our admin directly.",
      filterHeading: "Category Filter",
      all: "All",
      empty: "No portfolio items in this category yet.",
      categories: {
        "e-commerce": "E-Commerce",
        "f&b": "F&B / Culinary",
        "property": "Property",
        "retail": "Retail",
        "education": "Education",
        "company profile": "Company Profile",
        "media": "Media & News",
        "travel umroh": "Travel & Umrah",
        "otomotif": "Automotive",
        "landing page": "Landing Page",
        "toko online": "Online Store",
        "lainnya": "Others",
      } as Record<string, string>,
      projects: {
        "LUMA Skin": {
          tag: "E-Commerce - Skincare",
          desc: "Luxury skincare platform with premium e-commerce integration, pampering customers with an elegant shopping experience."
        },
        "Ayam Geprek Luma": {
          tag: "F&B - SME",
          desc: "Geprek chicken ordering website with mouth-watering presentation and interactive menu selection."
        },
        "LUMA Culinary": {
          tag: "F&B - Premium",
          desc: "Exclusive gastronomy site that elevating culinary heritage into art through elegant and minimalist design."
        },
        "Luma Restaurant": {
          tag: "F&B - Company Profile",
          desc: "Premium restaurant website with stunning menu presentations and functional features to pamper guests."
        },
        "Pencari Kost Luma": {
          tag: "Property - Platform",
          desc: "Modern and premium boarding house search platform. Offering intuitive navigation for the best housing search experience."
        },
        "Kostum Adat Nusantara": {
          tag: "Traditional Costume Rental",
          desc: "The most complete traditional clothing rental center in Lebak Bandung, Jambi City. Collection of 38 provinces, formal suits, and Jasco."
        },
        "Bimbel Luma Admin": {
          tag: "Education - Admin Dashboard",
          desc: "Modern admin dashboard to manage tutoring tenants, dynamic branding, and operational control in one centralized system."
        },
        "LPJD": {
          tag: "Landing Page - Company Profile",
          desc: "Professional landing page to present services concisely, convincingly, and focused on potential client conversion."
        },
        "Bimbel Luma": {
          tag: "Education - Tutoring Platform",
          desc: "Interactive tutoring website with class selection flows, tutor info, and user-friendly experience for students and parents."
        },
        "BeritaPixel Luma": {
          tag: "Media - Tech News",
          desc: "Technology news and content platform with strong editorial visual style, modern navigation, and focus on engaging reading experience."
        },
        "BeritaModern Luma": {
          tag: "Media - News Portal",
          desc: "Modern news portal with clean editorial layout, informative content structure, and neat reading experience across devices."
        },
        "Atuna Umroh Jambi": {
          tag: "Travel - Umrah & Hajj",
          desc: "Trusted travel agency website for Umrah and Hajj in Jambi with exclusive packages, Sunnah-compliant services, and an unforgettable journey."
        },
        "Luma Dealer": {
          tag: "Automotive - Car Dealership",
          desc: "Premium car dealership platform with exclusive vehicle catalog, test drive booking, and luxurious, trustworthy car shopping experience."
        },
        "Reiwa LMS": {
          tag: "Education - LMS",
          desc: "Premium Japanese learning platform with structured curriculum, interactive JLPT materials, and modern learning experience to master Nihongo."
        },
        "PT Gemilang Aksara Sejahtera": {
          tag: "Company Profile - Construction",
          desc: "Company profile website for PT. Gemilang Aksara Sejahtera highlighting professional architecture, interior design, and construction services."
        },
        "Lumahive Rekomendasi": {
          tag: "E-Commerce - Affiliate & Curation",
          desc: "Curated platform showcasing the best product recommendations across categories—fashion, culinary, and beauty—to help consumers shop smarter."
        }
      } as Record<string, { tag: string; desc: string }>,
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.id;
export default translations;

export async function translateToEnglish(text: string): Promise<string> {
  if (!text) return "";
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map((x: any) => x[0]).join("");
    }
    return text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}
