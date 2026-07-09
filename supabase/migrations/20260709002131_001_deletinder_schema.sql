/*
# Deletinder - Schema Inicial

1. Novas Tabelas
- `profiles`: dados do usuário (nome, bio, foto, status de aprovação)
  - `id` (uuid, PK, referencia auth.users)
  - `full_name` (text)
  - `bio` (text)
  - `avatar_url` (text)
  - `status` (text: 'pending', 'approved', 'rejected')
  - `created_at` (timestamp)

- `certificate_requests`: certificados enviados para validação
  - `id` (uuid, PK)
  - `user_id` (uuid, FK para profiles)
  - `certificate_url` (text, URL do certificado armazenado)
  - `status` (text: 'pending', 'approved', 'rejected')
  - `reviewed_by` (uuid, FK para profiles - moderador)
  - `reviewed_at` (timestamp)
  - `created_at` (timestamp)

- `mocks`: simulações/mocks disponíveis
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `committee` (text)
  - `created_by` (uuid, FK para profiles)
  - `created_at` (timestamp)

2. Storage
- Bucket `certificates` para upload de certificados

3. Segurança
- RLS habilitado em todas as tabelas
- Usuários só veem seus próprios dados
- Moderadores podem ver certificados pendentes
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  avatar_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Certificate Requests
CREATE TABLE IF NOT EXISTS certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cert_requests_select_own" ON certificate_requests;
CREATE POLICY "cert_requests_select_own" ON certificate_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cert_requests_insert_own" ON certificate_requests;
CREATE POLICY "cert_requests_insert_own" ON certificate_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Mocks
CREATE TABLE IF NOT EXISTS mocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  committee text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mocks_select_approved" ON mocks;
CREATE POLICY "mocks_select_approved" ON mocks FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
  ));

DROP POLICY IF EXISTS "mocks_insert_approved" ON mocks;
CREATE POLICY "mocks_insert_approved" ON mocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved')
    AND auth.uid() = created_by
  );

-- Storage bucket for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for certificates
DROP POLICY IF EXISTS "certificates_insert_own" ON storage.objects;
CREATE POLICY "certificates_insert_own" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "certificates_select_own" ON storage.objects;
CREATE POLICY "certificates_select_own" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'certificates');

