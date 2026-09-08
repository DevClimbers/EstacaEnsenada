import * as Y from 'yjs'
import { BlockNoteEditor } from '@blocknote/core'
import { blocksToYDoc, yDocToBlocks } from '@blocknote/core/yjs'
import type { PartialBlock } from '@blocknote/core'
import { fromBase64, toBase64 } from './codec'

/** Nombre del fragmento Yjs que usa el editor de agendas. */
export const FRAGMENTO_AGENDA = 'agenda'

// Editor "headless" (sin DOM ni React) solo para conocer el esquema de bloques
// y poder convertir entre JSON de BlockNote y el documento Yjs.
let editorCache: BlockNoteEditor | null = null
function getEditor() {
  if (!editorCache) editorCache = BlockNoteEditor.create()
  return editorCache
}

/** Convierte el JSON de BlockNote de una agenda existente en un estado Yjs (base64). */
export function bloquesAYjs(bloques: PartialBlock[]): string {
  const doc = blocksToYDoc(getEditor(), bloques, FRAGMENTO_AGENDA)
  return toBase64(Y.encodeStateAsUpdate(doc))
}

/**
 * Fusiona el estado que ya está en la BD con el que manda el cliente.
 * Yjs es conmutativo e idempotente: da igual el orden y no se pierde nada,
 * aunque el cliente traiga un estado viejo.
 */
export function fusionarYjs(actual: string | null, entrante: string): string {
  if (!actual) return entrante
  const merged = Y.mergeUpdates([fromBase64(actual), fromBase64(entrante)])
  return toBase64(merged)
}

/** Deriva el JSON de BlockNote (copia de lectura) a partir del estado Yjs. */
export function yjsABloques(estado: string): unknown[] {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, fromBase64(estado))
  return yDocToBlocks(getEditor(), doc, FRAGMENTO_AGENDA)
}
