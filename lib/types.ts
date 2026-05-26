// ============================================================
// Tipos TypeScript — CRM Presidencia de Estaca
// Alineados al schema de Supabase (tablas crm_*)
// ============================================================

export type Rol = 'presidente' | 'consejero' | 'secretario'
export type EstadoReunion = 'borrador' | 'en_curso' | 'finalizada'
export type EstadoCompromiso = 'pendiente' | 'en_progreso' | 'completado' | 'cancelado'
export type EstadoEntrevista = 'pendiente' | 'agendada' | 'realizada' | 'cancelada'
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
export type Prioridad = 'alta' | 'media' | 'baja'
export type TipoEntrevista =
  | 'membresia'
  | 'recomendacion_templo'
  | 'llamamiento'
  | 'consejo_membresia'
  | 'bendicion_patriarcal'
  | 'otra'

export interface Perfil {
  id: string
  nombre: string
  rol: Rol
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Reunion {
  id: string
  titulo: string
  fecha: string            // DATE → 'YYYY-MM-DD'
  hora_inicio: string | null
  hora_fin: string | null
  estado: EstadoReunion
  contenido: unknown | null  // BlockNote PartialBlock[] JSON
  blocknote_version: string | null
  archivado: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Compromiso {
  id: string
  titulo: string
  descripcion: string | null
  reunion_id: string | null
  asignado_a: string | null
  fecha_limite: string | null  // DATE → 'YYYY-MM-DD'
  estado: EstadoCompromiso
  prioridad: Prioridad
  kanban_orden: number
  archivado: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joins opcionales
  perfil_asignado?: Pick<Perfil, 'id' | 'nombre' | 'avatar_url'>
  reunion?: Pick<Reunion, 'id' | 'titulo' | 'fecha'>
}

export interface Entrevista {
  id: string
  nombre_miembro: string
  unidad_id: string | null
  tipo: TipoEntrevista
  estado: EstadoEntrevista
  fecha_agendada: string | null  // TIMESTAMPTZ
  lugar: string | null
  notas: string | null
  asignado_a: string | null
  kanban_orden: number
  archivado: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joins opcionales
  perfil_asignado?: Pick<Perfil, 'id' | 'nombre' | 'avatar_url'>
}

export interface Tarea {
  id: string
  titulo: string
  descripcion: string | null
  asignado_a: string | null
  fecha_limite: string | null
  estado: EstadoTarea
  prioridad: Prioridad
  kanban_orden: number
  archivado: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joins opcionales
  perfil_asignado?: Pick<Perfil, 'id' | 'nombre' | 'avatar_url'>
}

export interface IaInsight {
  id: string
  tipo: 'recordatorio' | 'recomendacion' | 'patron' | 'resumen'
  contenido: string
  referencia: unknown | null
  solicitado_por: string | null
  visto: boolean
  created_at: string
}

// Colores de la estaca
export const COLORS = {
  navy: '#1B2A5E',
  dorado: '#C9A84C',
} as const

// Etiquetas de estado para UI
export const ESTADO_REUNION_LABELS: Record<EstadoReunion, string> = {
  borrador: 'Borrador',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
}

export const ESTADO_COMPROMISO_LABELS: Record<EstadoCompromiso, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const ROL_LABELS: Record<Rol, string> = {
  presidente: 'Presidente',
  consejero: 'Consejero',
  secretario: 'Secretario',
}

export const TIPO_ENTREVISTA_LABELS: Record<TipoEntrevista, string> = {
  membresia: 'Membresía',
  recomendacion_templo: 'Recomendación del Templo',
  llamamiento: 'Llamamiento',
  consejo_membresia: 'Consejo de Membresía',
  bendicion_patriarcal: 'Bendición Patriarcal',
  otra: 'Otra',
}
