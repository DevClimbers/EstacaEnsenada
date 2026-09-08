-- ============================================================
-- 002 — Storage para imágenes adjuntas en agendas
-- Bucket público `agendas`: lectura abierta (las URLs quedan
-- guardadas dentro del JSON de la agenda), escritura solo para
-- miembros de la presidencia (crm_es_miembro()).
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agendas',
  'agendas',
  TRUE,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas sobre storage.objects (RLS ya está habilitado por Supabase)
DROP POLICY IF EXISTS "agendas_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "agendas_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "agendas_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "agendas_storage_delete" ON storage.objects;

CREATE POLICY "agendas_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'agendas');

CREATE POLICY "agendas_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'agendas' AND public.crm_es_miembro());

CREATE POLICY "agendas_storage_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'agendas' AND public.crm_es_miembro());

CREATE POLICY "agendas_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'agendas' AND public.crm_es_miembro());
