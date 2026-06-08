-- ============================================================
-- SUPABASE SQL SCHEMA — SupervisãoAgentes
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'supervisor' CHECK (role IN ('admin', 'supervisor')),
  telefone    TEXT,
  zona        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. AGENTES
CREATE TABLE IF NOT EXISTS public.agentes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  bi            TEXT,
  telefone      TEXT,
  email         TEXT,
  zona          TEXT,
  foto_url      TEXT,
  data_inicio   DATE,
  status        TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agentes_updated_at BEFORE UPDATE ON public.agentes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 3. AUDITORIAS
CREATE TABLE IF NOT EXISTS public.auditorias (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agente_id     UUID REFERENCES public.agentes(id) ON DELETE CASCADE NOT NULL,
  supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_visita   DATE NOT NULL,
  hora_visita   TIME,
  localizacao   TEXT,
  checklist     JSONB DEFAULT '{}',
  avaliacao     SMALLINT CHECK (avaliacao BETWEEN 1 AND 5),
  observacoes   TEXT,
  fotos         TEXT[] DEFAULT '{}',
  status        TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER auditorias_updated_at BEFORE UPDATE ON public.auditorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agentes_supervisor ON public.agentes(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_agente ON public.auditorias(agente_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_supervisor ON public.auditorias(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_status ON public.auditorias(status);
CREATE INDEX IF NOT EXISTS idx_auditorias_data ON public.auditorias(data_visita);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- AGENTES: admin sees all, supervisor sees own
DROP POLICY IF EXISTS "agentes_select" ON public.agentes;
CREATE POLICY "agentes_select" ON public.agentes FOR SELECT
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "agentes_insert" ON public.agentes;
CREATE POLICY "agentes_insert" ON public.agentes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "agentes_update" ON public.agentes;
CREATE POLICY "agentes_update" ON public.agentes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "agentes_delete" ON public.agentes;
CREATE POLICY "agentes_delete" ON public.agentes FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- AUDITORIAS: supervisor sees own, admin sees all
DROP POLICY IF EXISTS "auditorias_select" ON public.auditorias;
CREATE POLICY "auditorias_select" ON public.auditorias FOR SELECT
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "auditorias_insert" ON public.auditorias;
CREATE POLICY "auditorias_insert" ON public.auditorias FOR INSERT
  WITH CHECK (supervisor_id = auth.uid());

DROP POLICY IF EXISTS "auditorias_update" ON public.auditorias;
CREATE POLICY "auditorias_update" ON public.auditorias FOR UPDATE
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Crie um bucket chamado "fotos" no painel do Supabase > Storage
-- Com as seguintes políticas:
--
-- SELECT (public read):
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "fotos_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos');

CREATE POLICY "fotos_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fotos' AND auth.role() = 'authenticated');

CREATE POLICY "fotos_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'fotos' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- ADMIN USER — crie o primeiro admin manualmente:
-- 1. Crie o utilizador em Authentication > Users
-- 2. Execute:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@exemplo.com';
-- ============================================================
