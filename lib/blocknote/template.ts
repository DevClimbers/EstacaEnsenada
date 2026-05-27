import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Tipo simplificado compatible con BlockNote PartialBlock[]
type PartialBlockContent = {
  type: string
  props?: Record<string, unknown>
  content?: Array<{ type: string; text: string; styles: Record<string, boolean> }>
  children?: PartialBlockContent[]
}

/**
 * Retorna el contenido inicial de BlockNote para una nueva agenda.
 * Usa PartialBlock[] — BlockNote genera los IDs automáticamente.
 */
export function getPlantillaAgenda(fecha: Date): PartialBlockContent[] {
  const fechaStr = format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })

  return [
    {
      type: 'heading',
      props: { level: 1, textAlignment: 'left' },
      content: [
        {
          type: 'text',
          text: `Reunión de Presidencia — ${fechaStr}`,
          styles: {},
        },
      ],
      children: [],
    },
    {
      type: 'numberedListItem',
      content: [{ type: 'text', text: 'Apertura y oración', styles: {} }],
      children: [],
    },
    {
      type: 'numberedListItem',
      content: [
        {
          type: 'text',
          text: 'Revisión de compromisos anteriores',
          styles: { bold: true },
        },
      ],
      children: [],
    },
    {
      type: 'numberedListItem',
      content: [{ type: 'text', text: 'Puntos de agenda', styles: {} }],
      children: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Agregar puntos aquí…',
              styles: { italic: true },
            },
          ],
          children: [],
        },
      ],
    },
    {
      type: 'numberedListItem',
      content: [{ type: 'text', text: 'Asuntos varios', styles: {} }],
      children: [],
    },
    {
      type: 'numberedListItem',
      content: [
        {
          type: 'text',
          text: 'Compromisos de esta reunión',
          styles: { bold: true },
        },
      ],
      children: [],
    },
    {
      type: 'numberedListItem',
      content: [{ type: 'text', text: 'Cierre', styles: {} }],
      children: [],
    },
  ]
}

/** Versión actual de BlockNote instalada — se guarda con cada reunión */
export const BLOCKNOTE_VERSION = '0.51.3'
