-- ====================================================================
-- JALANKAN INI DI: Supabase Dashboard > SQL Editor > New Query
-- Membuat tabel portfolios baru dan konfigurasi Storage Bucket 'portfolios'
-- ====================================================================

-- 1. Buat Tabel Portofolio Baru
CREATE TABLE IF NOT EXISTS public.portfolios (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     text NOT NULL,
  title       text NOT NULL,
  tag         text DEFAULT '',
  category    text NOT NULL,
  description text NOT NULL DEFAULT '',
  img         text NOT NULL, -- Menyimpan URL foto hasil upload
  link        text DEFAULT '',
  github      text DEFAULT ''
);

-- 2. Aktifkan Row Level Security (RLS) pada tabel portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- 3. Policy RLS agar client anonim bisa mengelola portofolio (CRUD)
DROP POLICY IF EXISTS "Users manage own portfolios" ON public.portfolios;
CREATE POLICY "Users manage own portfolios" ON public.portfolios
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. Inisialisasi Storage Bucket 'portfolios' di Supabase
-- Batas file_size_limit diatur 102400 bytes (100KB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolios', 'portfolios', true, 102400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 102400, 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 5. Kebijakan RLS untuk storage.objects (akses bucket 'portfolios')
DROP POLICY IF EXISTS "Public Read Portfolios" ON storage.objects;
CREATE POLICY "Public Read Portfolios" ON storage.objects 
  FOR SELECT TO anon USING (bucket_id = 'portfolios');

DROP POLICY IF EXISTS "Public Insert Portfolios" ON storage.objects;
CREATE POLICY "Public Insert Portfolios" ON storage.objects 
  FOR INSERT TO anon WITH CHECK (bucket_id = 'portfolios');

DROP POLICY IF EXISTS "Public Delete Portfolios" ON storage.objects;
CREATE POLICY "Public Delete Portfolios" ON storage.objects 
  FOR DELETE TO anon USING (bucket_id = 'portfolios');
