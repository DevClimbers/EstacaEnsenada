'use client'

import * as Y from 'yjs'
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { fromBase64, toBase64 } from './codec'

/**
 * Provider Yjs sobre Supabase Realtime (broadcast).
 *
 * - Cada cambio local del documento se transmite a los demás navegadores.
 * - Al conectar se hace un intercambio de "state vectors" para ponerse al día
 *   con lo que otros escribieron antes de que entráramos.
 * - La presencia (cursores con nombre/color) viaja por el mismo canal usando
 *   el protocolo de awareness de Yjs.
 *
 * La persistencia NO es responsabilidad del provider: el editor guarda el
 * estado en la BD vía API y el servidor fusiona con lo que ya exista.
 */
export class SupabaseYjsProvider {
  readonly awareness: Awareness
  readonly doc: Y.Doc
  private channel: RealtimeChannel
  private conectado = false
  private pendientes: Uint8Array[] = []
  private heartbeat: ReturnType<typeof setInterval> | undefined
  private onDocUpdate: (update: Uint8Array, origin: unknown) => void
  private onAwarenessUpdate: (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => void
  private onUnload = () => {
    removeAwarenessStates(this.awareness, [this.doc.clientID], 'unload')
  }
  private listeners = new Set<(estado: 'conectado' | 'desconectado') => void>()

  constructor(supabase: SupabaseClient, sala: string, doc: Y.Doc, awareness?: Awareness) {
    this.doc = doc
    this.awareness = awareness ?? new Awareness(doc)

    this.channel = supabase.channel(`yjs:${sala}`, {
      config: { broadcast: { self: false, ack: false } },
    })

    this.onDocUpdate = (update, origin) => {
      if (origin === this) return
      this.enviar('update', { u: toBase64(update) })
    }

    this.onAwarenessUpdate = ({ added, updated, removed }, origin) => {
      if (origin === this) return
      const clients = added.concat(updated, removed)
      this.enviar('awareness', {
        u: toBase64(encodeAwarenessUpdate(this.awareness, clients)),
      })
    }

    doc.on('update', this.onDocUpdate)
    this.awareness.on('update', this.onAwarenessUpdate)
    window.addEventListener('beforeunload', this.onUnload)

    this.channel
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        Y.applyUpdate(doc, fromBase64(payload.u), this)
      })
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        // Otro cliente pide lo que le falta: le mandamos la diferencia.
        const diff = Y.encodeStateAsUpdate(doc, fromBase64(payload.sv))
        if (diff.length > 2) this.enviar('update', { u: toBase64(diff) })
        // Y le pedimos lo que a nosotros nos falta (solo una vez, sin ping-pong).
        if (!payload.respuesta) this.pedirSync(true)
        // Reenviamos nuestra presencia para que nos vea de inmediato.
        this.enviarAwarenessLocal()
      })
      .on('broadcast', { event: 'awareness' }, ({ payload }) => {
        applyAwarenessUpdate(this.awareness, fromBase64(payload.u), this)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.conectado = true
          this.pedirSync(false)
          this.enviarAwarenessLocal()
          // Vaciar lo que se escribió antes de conectar
          for (const u of this.pendientes) this.enviar('update', { u: toBase64(u) })
          this.pendientes = []
          this.emitir('conectado')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.conectado = false
          this.emitir('desconectado')
        }
      })

    // Awareness caduca a los 30 s sin noticias: refrescar periódicamente.
    this.heartbeat = setInterval(() => this.enviarAwarenessLocal(), 15000)
  }

  onEstado(cb: (estado: 'conectado' | 'desconectado') => void) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  get estaConectado() {
    return this.conectado
  }

  private emitir(estado: 'conectado' | 'desconectado') {
    for (const cb of this.listeners) cb(estado)
  }

  private pedirSync(respuesta: boolean) {
    this.enviar('sync', { sv: toBase64(Y.encodeStateVector(this.doc)), respuesta })
  }

  private enviarAwarenessLocal() {
    if (!this.conectado || this.awareness.getLocalState() === null) return
    this.enviar('awareness', {
      u: toBase64(encodeAwarenessUpdate(this.awareness, [this.doc.clientID])),
    })
  }

  private enviar(event: 'update' | 'sync' | 'awareness', payload: Record<string, unknown>) {
    if (!this.conectado) {
      if (event === 'update') this.pendientes.push(fromBase64(payload.u as string))
      return
    }
    void this.channel.send({ type: 'broadcast', event, payload })
  }

  destroy() {
    clearInterval(this.heartbeat)
    window.removeEventListener('beforeunload', this.onUnload)
    // Avisar a los demás que nos fuimos (mientras el listener sigue activo)
    // y restaurar el estado local: la awareness pertenece al editor, no a
    // este provider, y puede seguir usándose (p. ej. remount en desarrollo).
    const local = this.awareness.getLocalState()
    this.onUnload()
    this.doc.off('update', this.onDocUpdate)
    this.awareness.off('update', this.onAwarenessUpdate)
    if (local) this.awareness.setLocalState(local)
    void this.channel.unsubscribe()
    this.listeners.clear()
  }
}
