/*
# Sistema de Moderadores

1. Mudanças em Tabelas Existentes
- `profiles`: Adiciona coluna `is_moderator` (boolean, default false)
  - Moderadores podem aprovar/rejeitar certificados

2. Políticas de Segurança Atualizadas
- Moderadores podem ver todos os perfis
- Moderadores podem ver todas as solicitações de certificado
- Moderadores podem atualizar status de certificados e perfis

3. Importante
- O primeiro moderador deve ser definido manualmente no banco
- Use: UPDATE profiles SET is_moderator = true WHERE email = 'admin@email.com';
*/

-- Adicionar coluna is_moderator
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;

-- Política para moderadores verem todos os perfis
DROP POLICY IF EXISTS "moderators_select_all_profiles" ON profiles;
CREATE POLICY "moderators_select_all_profiles" ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  );

-- Política para moderadores atualizarem perfis
DROP POLICY IF EXISTS "moderators_update_profiles" ON profiles;
CREATE POLICY "moderators_update_profiles" ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  );

-- Política para moderadores verem todas as solicitações de certificado
DROP POLICY IF EXISTS "cert_requests_select_own" ON certificate_requests;
CREATE POLICY "cert_requests_select_own" ON certificate_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  );

-- Política para moderadores atualizarem solicitações de certificado
DROP POLICY IF EXISTS "moderators_update_cert_requests" ON certificate_requests;
CREATE POLICY "moderators_update_cert_requests" ON certificate_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_moderator = true
    )
  );
