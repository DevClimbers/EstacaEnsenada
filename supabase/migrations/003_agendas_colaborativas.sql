-- ============================================================
-- Agendas colaborativas en tiempo real (Yjs + Supabase Realtime)
-- ============================================================

-- Estado del documento Yjs (update completo, codificado en base64).
-- `contenido` (JSON de BlockNote) se conserva como copia de lectura
-- derivada del documento Yjs.
ALTER TABLE crm_reuniones
  ADD COLUMN IF NOT EXISTS contenido_yjs TEXT;

-- Compromisos en vivo: publicar cambios de la tabla por Realtime
-- (postgres_changes respeta RLS del usuario suscrito).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'crm_compromisos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE crm_compromisos;
  END IF;
END $$;
