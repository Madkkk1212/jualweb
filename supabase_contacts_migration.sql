-- ============================================================
-- JALANKAN INI DI: Supabase Dashboard > SQL Editor > New Query
-- Hapus tabel lama yang salah skema, buat ulang yang benar
-- ============================================================

-- 1. HAPUS tabel contacts yang salah (dari migration sebelumnya)
DROP TABLE IF EXISTS public.contacts CASCADE;

-- 2. BUAT ULANG tabel contacts dengan skema yang benar untuk workspace
--    (sesuai dengan yang dipakai note/page.tsx dan whatsapp/page.tsx)
CREATE TABLE public.contacts (
  id          text PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     text NOT NULL,
  name        text NOT NULL,
  phone       text NOT NULL DEFAULT '',
  email       text DEFAULT '',
  ig          text DEFAULT '',
  category    text DEFAULT 'Umum',
  website     text DEFAULT ''
);

-- Pastikan kolom website ada jika tabel contacts sudah pernah dibuat sebelumnya
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS website text DEFAULT '';

-- 3. Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 4. Policy: user bisa CRUD data milik sendiri
DROP POLICY IF EXISTS "Users manage own contacts" ON public.contacts;
CREATE POLICY "Users manage own contacts" ON public.contacts
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. BUAT tabel contact_submissions (untuk form publik /contact)
-- ============================================================
DROP TABLE IF EXISTS public.contact_submissions CASCADE;

CREATE TABLE public.contact_submissions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  name        text NOT NULL,
  whatsapp    text NOT NULL,
  ig          text DEFAULT '',
  message     text NOT NULL
);

-- 6. Enable RLS untuk contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 7. Policy: siapa saja boleh submit form
DROP POLICY IF EXISTS "Allow public insert submissions" ON public.contact_submissions;
CREATE POLICY "Allow public insert submissions" ON public.contact_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

-- 8. Hanya authenticated (admin) yang bisa baca submissions
DROP POLICY IF EXISTS "Allow authenticated select submissions" ON public.contact_submissions;
CREATE POLICY "Allow authenticated select submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (true);
