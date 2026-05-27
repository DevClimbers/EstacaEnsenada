// ============================================================
// Kanban — tipos y utilidades de mapeo
// ============================================================

export type KanbanTipo = 'compromiso' | 'tarea' | 'entrevista'
export type KanbanColumna = 'pendiente' | 'progreso' | 'completado' | 'cancelado'

/** Elemento unificado que llena el tablero Kanban */
export interface KanbanItem {
  id: string
  tipo: KanbanTipo
  titulo: string
  estado: string
  columna: KanbanColumna
  kanban_orden: number
  prioridad?: 'alta' | 'media' | 'baja'
  asignado_a?: string | null
  asignadoNombre?: string | null
  /** fecha_limite (compromisos/tareas) o fecha_agendada (entrevistas) */
  fecha?: string | null
  /** subtítulo secundario: tipo entrevista, unidad, reunión de origen */
  subtitulo?: string | null
}

export interface KanbanColumnaConfig {
  id: KanbanColumna
  label: string
  emoji: string
}

export const COLUMNAS: KanbanColumnaConfig[] = [
  { id: 'pendiente',  label: 'Pendiente',   emoji: '📥' },
  { id: 'progreso',   label: 'En progreso', emoji: '🔄' },
  { id: 'completado', label: 'Completado',  emoji: '✅' },
  { id: 'cancelado',  label: 'Cancelado',   emoji: '🚫' },
]

/** Convierte el campo `estado` de la BD a la columna visual */
export function estadoToColumna(estado: string): KanbanColumna {
  const map: Record<string, KanbanColumna> = {
    pendiente:   'pendiente',
    en_progreso: 'progreso',
    agendada:    'progreso',
    completado:  'completado',
    completada:  'completado',
    realizada:   'completado',
    cancelado:   'cancelado',
    cancelada:   'cancelado',
  }
  return map[estado] ?? 'pendiente'
}

/** Convierte columna + tipo → el valor de `estado` correcto para esa tabla */
export function columnaToEstado(columna: KanbanColumna, tipo: KanbanTipo): string {
  const map: Record<KanbanColumna, Record<KanbanTipo, string>> = {
    pendiente:  { compromiso: 'pendiente',   tarea: 'pendiente',   entrevista: 'pendiente'  },
    progreso:   { compromiso: 'en_progreso', tarea: 'en_progreso', entrevista: 'agendada'   },
    completado: { compromiso: 'completado',  tarea: 'completada',  entrevista: 'realizada'  },
    cancelado:  { compromiso: 'cancelado',   tarea: 'cancelada',   entrevista: 'cancelada'  },
  }
  return map[columna][tipo]
}

/** Endpoint REST para cada tipo */
export const API_ENDPOINT: Record<KanbanTipo, string> = {
  compromiso: '/api/compromisos',
  tarea:      '/api/tareas',
  entrevista: '/api/entrevistas',
}
