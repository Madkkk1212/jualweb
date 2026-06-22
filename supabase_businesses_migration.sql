-- ====================================================================
-- JALANKAN INI DI: Supabase Dashboard > SQL Editor > New Query
-- Membuat tabel baru untuk fitur Import Bisnis
-- ====================================================================

-- 1. Tabel UPLOADS (riwayat unggahan file)
CREATE TABLE IF NOT EXISTS public.uploads (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  user_id         text NOT NULL,
  filename        text NOT NULL,
  file_url        text,
  status          text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_rows      integer DEFAULT 0,
  processed_rows  integer DEFAULT 0,
  duplicate_rows  integer DEFAULT 0
);

-- 2. Tabel BUSINESSES (seluruh data bisnis hasil impor)
CREATE TABLE IF NOT EXISTS public.businesses (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  upload_id     uuid REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id       text NOT NULL,
  name          text NOT NULL,
  contact_name  text DEFAULT '',
  category      text DEFAULT 'Umum',
  instagram     text DEFAULT NULL,
  facebook      text DEFAULT NULL,
  website       text DEFAULT NULL,
  has_website   boolean DEFAULT false,
  phone         text DEFAULT NULL,
  phone_type    text DEFAULT NULL, -- 'seluler' atau 'daerah'
  address       text DEFAULT '',
  street        text DEFAULT '',
  district      text DEFAULT '',
  city          text DEFAULT '',
  province      text DEFAULT ''
);

-- Pastikan kolom category ada jika tabel businesses sudah pernah dibuat sebelumnya
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category text DEFAULT 'Umum';

-- 3. Tabel PROCESSING_LOGS (log detail proses impor data)
CREATE TABLE IF NOT EXISTS public.processing_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  upload_id   uuid REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  log_level   text NOT NULL, -- 'info', 'warning', 'error'
  message     text NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan RLS (CRUD anonim disesuaikan dengan contacts/links)
DROP POLICY IF EXISTS "Users manage own uploads" ON public.uploads;
CREATE POLICY "Users manage own uploads" ON public.uploads
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users manage own businesses" ON public.businesses;
CREATE POLICY "Users manage own businesses" ON public.businesses
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users manage own processing_logs" ON public.processing_logs;
CREATE POLICY "Users manage own processing_logs" ON public.processing_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indeks performa untuk query cepat dan pencarian duplikasi
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_lookup ON public.businesses(user_id, name, phone, website);
CREATE INDEX IF NOT EXISTS idx_logs_upload_id ON public.processing_logs(upload_id);
