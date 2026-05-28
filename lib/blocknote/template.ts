import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Tipo simplificado compatible con BlockNote PartialBlock[]
type InlineContent = { type: string; text: string; styles: Record<string, boolean> }
type PBContent = {
  type: string
  props?: Record<string, unknown>
  content?: InlineContent[]
  children?: PBContent[]
}

/** Párrafo vacío — espacio para notas */
const vacio = (): PBContent => ({ type: 'paragraph', content: [], children: [] })
const vacios = (n: number): PBContent[] => Array.from({ length: n }, vacio)

/** Texto plano */
const t = (text: string, styles: Record<string, boolean> = {}): InlineContent =>
  ({ type: 'text', text, styles })

/**
 * Plantilla de agenda para la Reunión de Presidencia de Estaca Ensenada.
 * Replicada de la agenda física oficial (Manual General).
 */
export function getPlantillaAgenda(fecha: Date): PBContent[] {
  const fechaStr = format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })

  return [
    // ── Encabezado ──────────────────────────────────────────────
    {
      type: 'heading',
      props: { level: 1, textAlignment: 'left' },
      content: [t(`Reunión de Presidencia de Estaca — ${fechaStr}`)],
      children: [],
    },

    // ── Apertura ────────────────────────────────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Apertura')],
      children: [],
    },
    {
      type: 'paragraph',
      content: [t('Himno: ', { bold: true })],
      children: [],
    },
    {
      type: 'paragraph',
      content: [t('Oración: ', { bold: true })],
      children: [],
    },
    {
      type: 'paragraph',
      content: [t('Manual General: ', { bold: true })],
      children: [],
    },
    vacio(),

    // ── La Obra de Dios de Salvación y Exaltación ────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('La Obra de Dios de Salvación y Exaltación')],
      children: [],
    },

    // Sub: Vivir el Evangelio
    {
      type: 'heading',
      props: { level: 3, textAlignment: 'left' },
      content: [t('Vivir el Evangelio de Jesucristo '), t('(autosuficiencia)', { italic: true })],
      children: [],
    },
    ...vacios(4),

    // Sub: Cuidar de los necesitados
    {
      type: 'heading',
      props: { level: 3, textAlignment: 'left' },
      content: [t('Cuidar de los necesitados')],
      children: [],
    },
    ...vacios(4),

    // Sub: Invitar a todos
    {
      type: 'heading',
      props: { level: 3, textAlignment: 'left' },
      content: [t('Invitar a todos a recibir el evangelio')],
      children: [],
    },
    ...vacios(4),

    // Sub: Unir a las familias
    {
      type: 'heading',
      props: { level: 3, textAlignment: 'left' },
      content: [t('Unir a las familias por la eternidad')],
      children: [],
    },
    ...vacios(4),
    vacio(),

    // ── Necesidades y fortalezas de las unidades ─────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Necesidades y fortalezas de los barrios, quórumes de élderes y organizaciones de la estaca')],
      children: [],
    },
    ...vacios(5),
    vacio(),

    // ── Ordenaciones al sacerdocio ────────────────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Recomendaciones de hombres para ser ordenados élderes')],
      children: [],
    },
    ...vacios(4),
    vacio(),

    // ── Llamamientos ─────────────────────────────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Llamamientos a cargos en la estaca y barrios')],
      children: [],
    },
    ...vacios(5),
    vacio(),

    // ── Comunicados Oficiales / Actividades ───────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Comunicados Oficiales / Actividades')],
      children: [],
    },
    ...vacios(5),
    vacio(),

    // ── Pendientes / Otros ────────────────────────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Pendientes / Otros')],
      children: [],
    },
    ...vacios(5),
    vacio(),

    // ── Cierre ────────────────────────────────────────────────────
    {
      type: 'heading',
      props: { level: 2, textAlignment: 'left' },
      content: [t('Cierre')],
      children: [],
    },
    {
      type: 'paragraph',
      content: [t('Última Oración: ', { bold: true })],
      children: [],
    },
    vacio(),
  ]
}

/** Versión actual de BlockNote instalada — se guarda con cada reunión */
export const BLOCKNOTE_VERSION = '0.51.3'
