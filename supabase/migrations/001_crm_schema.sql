-- ============================================================
-- MIGRACIÓN 001 — CRM Presidencia de Estaca
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Proyecto: presidencia-estaca (mismo Supabase que conferencia)
-- ============================================================
-- IMPORTANTE: Las tablas usan prefijo crm_ para coexistir con
-- unidades, boletos y registros sin colisiones de nombres.
-- ============================================================

-- ------------------------------------------------------------
-- TABLAS
-- ------------------------------------------------------------

-- Perfiles de los 5 miembros de la presidencia
CREATE TABLE IF NOT EXISTS crm_perfiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('presidente', 'consejero', 'secretario')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reuniones de presidencia
CREATE TABLE IF NOT EXISTS crm_reuniones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo            TEXT NOT NULL,
  fecha             DATE NOT NULL,
  hora_inicio       TIME,
  hora_fin          TIME,
  estado            TEXT DEFAULT 'borrador'
                    CHECK (estado IN ('borrador', 'en_curso', 'finalizada')),
  contenido         JSONB,
  blocknote_version TEXT,
  archivado         BOOLEAN DEFAULT FALSE,
  created_by        UUID REFERENCES crm_perfiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Compromisos de reuniones o independientes
CREATE TABLE IF NOT EXISTS crm_compromisos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  reunion_id      UUID REFERENCES crm_reuniones(id) ON DELETE SET NULL,
  asignado_a      UUID REFERENCES crm_perfiles(id),
  fecha_limite    DATE,
  estado          TEXT DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
  prioridad       TEXT DEFAULT 'media'
                  CHECK (prioridad IN ('alta', 'media', 'baja')),
  kanban_orden    INTEGER DEFAULT 1000,
  archivado       BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES crm_perfiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Entrevistas de presidencia
CREATE TABLE IF NOT EXISTS crm_entrevistas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_miembro   TEXT NOT NULL,
  unidad_id        TEXT REFERENCES unidades(id),
  tipo             TEXT NOT NULL
                   CHECK (tipo IN (
                     'membresia',
                     'recomendacion_templo',
                     'llamamiento',
                     'consejo_membresia',
                     'bendicion_patriarcal',
                     'otra'
                   )),
  estado           TEXT DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'agendada', 'realizada', 'cancelada')),
  fecha_agendada   TIMESTAMPTZ,
  lugar            TEXT,
  notas            TEXT,
  asignado_a       UUID REFERENCES crm_perfiles(id),
  kanban_orden     INTEGER DEFAULT 1000,
  archivado        BOOLEAN DEFAULT FALSE,
  created_by       UUID REFERENCES crm_perfiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Tareas generales
CREATE TABLE IF NOT EXISTS crm_tareas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo         TEXT NOT NULL,
  descripcion    TEXT,
  asignado_a     UUID REFERENCES crm_perfiles(id),
  fecha_limite   DATE,
  estado         TEXT DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  prioridad      TEXT DEFAULT 'media'
                 CHECK (prioridad IN ('alta', 'media', 'baja')),
  kanban_orden   INTEGER DEFAULT 1000,
  archivado      BOOLEAN DEFAULT FALSE,
  created_by     UUID REFERENCES crm_perfiles(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Insights de IA (Fase 4 — se crea ahora para no migrar después)
CREATE TABLE IF NOT EXISTS crm_ia_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo            TEXT CHECK (tipo IN ('recordatorio', 'recomendacion', 'patron', 'resumen')),
  contenido       TEXT NOT NULL,
  referencia      JSONB,
  solicitado_por  UUID REFERENCES crm_perfiles(id),
  visto           BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TRIGGER updated_at
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION crm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crm_perfiles_updated
  BEFORE UPDATE ON crm_perfiles
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

CREATE TRIGGER trg_crm_reuniones_updated
  BEFORE UPDATE ON crm_reuniones
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

CREATE TRIGGER trg_crm_compromisos_updated
  BEFORE UPDATE ON crm_compromisos
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

CREATE TRIGGER trg_crm_entrevistas_updated
  BEFORE UPDATE ON crm_entrevistas
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

CREATE TRIGGER trg_crm_tareas_updated
  BEFORE UPDATE ON crm_tareas
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_crm_reuniones_fecha     ON crm_reuniones(fecha);

CREATE INDEX IF NOT EXISTS idx_crm_compromisos_reunion  ON crm_compromisos(reunion_id);
CREATE INDEX IF NOT EXISTS idx_crm_compromisos_asignado ON crm_compromisos(asignado_a);
CREATE INDEX IF NOT EXISTS idx_crm_compromisos_estado   ON crm_compromisos(estado);
CREATE INDEX IF NOT EXISTS idx_crm_compromisos_fecha    ON crm_compromisos(fecha_limite);

CREATE INDEX IF NOT EXISTS idx_crm_entrevistas_unidad   ON crm_entrevistas(unidad_id);
CREATE INDEX IF NOT EXISTS idx_crm_entrevistas_asignado ON crm_entrevistas(asignado_a);
CREATE INDEX IF NOT EXISTS idx_crm_entrevistas_fecha    ON crm_entrevistas(fecha_agendada);
CREATE INDEX IF NOT EXISTS idx_crm_entrevistas_estado   ON crm_entrevistas(estado);

CREATE INDEX IF NOT EXISTS idx_crm_tareas_asignado      ON crm_tareas(asignado_a);
CREATE INDEX IF NOT EXISTS idx_crm_tareas_fecha         ON crm_tareas(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_crm_tareas_estado        ON crm_tareas(estado);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE crm_perfiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_reuniones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_compromisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tareas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_ia_insights ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: verifica que el usuario esté en crm_perfiles
CREATE OR REPLACE FUNCTION crm_es_miembro()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM crm_perfiles WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas
CREATE POLICY "crm_perfiles_select" ON crm_perfiles FOR SELECT USING (crm_es_miembro());
CREATE POLICY "crm_perfiles_insert" ON crm_perfiles FOR INSERT WITH CHECK (crm_es_miembro());
CREATE POLICY "crm_perfiles_update" ON crm_perfiles FOR UPDATE USING (crm_es_miembro());
-- NOTA: Los 5 perfiles iniciales deben insertarse desde el SQL Editor
-- como rol postgres (bypasa RLS). Ver seed al final de este archivo.

CREATE POLICY "crm_reuniones_all"    ON crm_reuniones    FOR ALL USING (crm_es_miembro());
CREATE POLICY "crm_compromisos_all"  ON crm_compromisos  FOR ALL USING (crm_es_miembro());
CREATE POLICY "crm_entrevistas_all"  ON crm_entrevistas  FOR ALL USING (crm_es_miembro());
CREATE POLICY "crm_tareas_all"       ON crm_tareas       FOR ALL USING (crm_es_miembro());
CREATE POLICY "crm_ia_insights_all"  ON crm_ia_insights  FOR ALL USING (crm_es_miembro());

-- ------------------------------------------------------------
-- VISTA CALENDARIO (Fase 3 — sin costo crearla ahora)
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW crm_calendario_eventos AS
  SELECT id, titulo AS title, fecha::TIMESTAMPTZ AS start, 'reunion' AS tipo
  FROM crm_reuniones WHERE archivado = FALSE
  UNION ALL
  SELECT id, nombre_miembro AS title, fecha_agendada AS start, 'entrevista' AS tipo
  FROM crm_entrevistas WHERE fecha_agendada IS NOT NULL AND archivado = FALSE
  UNION ALL
  SELECT id, titulo AS title, fecha_limite::TIMESTAMPTZ AS start, 'compromiso' AS tipo
  FROM crm_compromisos WHERE fecha_limite IS NOT NULL AND archivado = FALSE
  UNION ALL
  SELECT id, titulo AS title, fecha_limite::TIMESTAMPTZ AS start, 'tarea' AS tipo
  FROM crm_tareas WHERE fecha_limite IS NOT NULL AND archivado = FALSE;

-- ------------------------------------------------------------
-- SEED INICIAL (ejecutar después de crear usuarios en Auth)
-- Reemplaza los UUIDs con los IDs reales de cada usuario.
-- ------------------------------------------------------------
/*
INSERT INTO crm_perfiles (id, nombre, rol) VALUES
  ('<uuid-presidente>',  'José',        'presidente'),
  ('<uuid-consejero1>',  'Consejero 1', 'consejero'),
  ('<uuid-consejero2>',  'Consejero 2', 'consejero'),
  ('<uuid-secretario1>', 'Secretario 1','secretario'),
  ('<uuid-secretario2>', 'Secretario 2','secretario');
*/
