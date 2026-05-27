'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, X, ExternalLink, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { EventPill } from './EventPill'
import { NuevaReunionModal } from './NuevaReunionModal'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@/app/api/calendario/route'

type ViewMode = 'month' | 'week'

const TIPO_LABEL: Record<CalendarEvent['tipo'], string> = {
  reunion:    'Reunión',
  entrevista: 'Entrevista',
  compromiso: 'Compromiso',
  tarea:      'Tarea',
}

const LEGEND = [
  { tipo: 'reunion',    label: 'Reuniones',    color: 'bg-[#1B2A5E]' },
  { tipo: 'entrevista', label: 'Entrevistas',  color: 'bg-blue-500'  },
  { tipo: 'compromiso', label: 'Compromisos',  color: 'bg-amber-500' },
  { tipo: 'tarea',      label: 'Tareas',       color: 'bg-emerald-500' },
] as const

export function CalendarioView() {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Compute visible date range based on view
  const getRange = useCallback(() => {
    if (view === 'month') {
      const ms = startOfMonth(currentDate)
      const me = endOfMonth(currentDate)
      return {
        start: format(startOfWeek(ms, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
        end:   format(endOfWeek(me,   { weekStartsOn: 0 }), 'yyyy-MM-dd'),
      }
    } else {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
      const we = endOfWeek(currentDate,   { weekStartsOn: 0 })
      return {
        start: format(ws, 'yyyy-MM-dd'),
        end:   format(we, 'yyyy-MM-dd'),
      }
    }
  }, [view, currentDate])

  useEffect(() => {
    const { start, end } = getRange()
    setLoading(true)
    fetch(`/api/calendario?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data: CalendarEvent[]) => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [getRange, refreshKey])

  function navigate(dir: 'prev' | 'next') {
    if (view === 'month') {
      setCurrentDate(dir === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else {
      setCurrentDate(dir === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    }
    setSelectedDay(null)
    setSelectedEvent(null)
  }

  function goToday() {
    setCurrentDate(new Date())
    setSelectedDay(new Date())
    setSelectedEvent(null)
  }

  function handleSelectDay(day: Date) {
    setSelectedDay(isSameDay(day, selectedDay ?? new Date(-1)) ? null : day)
    setSelectedEvent(null)
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event)
  }

  // Title by view
  const title = view === 'month'
    ? format(currentDate, 'MMMM yyyy', { locale: es })
    : (() => {
        const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
        const we = endOfWeek(currentDate, { weekStartsOn: 0 })
        return `${format(ws, 'd MMM', { locale: es })} – ${format(we, 'd MMM yyyy', { locale: es })}`
      })()

  // Events for selected day panel
  const selectedDayEvents = selectedDay
    ? events.filter((e) => e.fecha === format(selectedDay, 'yyyy-MM-dd'))
    : []

  const showPanel = selectedDay !== null || selectedEvent !== null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main calendar area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-[#1B2A5E] hover:bg-[#243578] text-white"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Nueva reunión
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Hoy
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-base font-semibold text-gray-900 capitalize min-w-[180px]">
              {title}
            </h2>
            {loading && (
              <span className="text-xs text-gray-400 animate-pulse">Cargando…</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-3">
              {LEGEND.map((l) => (
                <div key={l.tipo} className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', l.color)} />
                  <span className="text-xs text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* View switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => { setView('month'); setSelectedDay(null); setSelectedEvent(null) }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  view === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Mes
              </button>
              <button
                onClick={() => { setView('week'); setSelectedDay(null); setSelectedEvent(null) }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  view === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Semana
              </button>
            </div>
          </div>
        </div>

        {/* Calendar body */}
        <div className="flex-1 overflow-auto">
          {view === 'month' ? (
            <MonthView
              currentDate={currentDate}
              events={events}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onEventClick={handleEventClick}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              events={events}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {/* Side panel */}
      {showPanel && (
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              {selectedDay && (
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              )}
              {selectedEvent && !selectedDay && (
                <p className="text-sm font-semibold text-gray-900">Detalle</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedDay && !selectedEvent && (
                <button
                  onClick={() => setModalOpen(true)}
                  title="Nueva reunión en este día"
                  className="text-gray-400 hover:text-[#1B2A5E] rounded-md p-1 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => { setSelectedDay(null); setSelectedEvent(null) }}
                className="text-gray-400 hover:text-gray-600 rounded-md p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-auto p-3">
            {selectedEvent ? (
              /* Event detail */
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400">
                    {TIPO_LABEL[selectedEvent.tipo]}
                  </span>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">
                    {selectedEvent.titulo}
                  </p>
                  {selectedEvent.hora && (
                    <p className="text-sm text-gray-500 mt-1">{selectedEvent.hora}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#1B2A5E] hover:bg-[#243578] text-white"
                    onClick={() => router.push(selectedEvent.href)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            ) : selectedDayEvents.length === 0 ? (
              /* Empty day */
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CalendarDays className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin eventos</p>
              </div>
            ) : (
              /* Day events list */
              <div className="space-y-0.5">
                {selectedDayEvents.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <NuevaReunionModal
        open={modalOpen}
        defaultFecha={selectedDay ? format(selectedDay, 'yyyy-MM-dd') : undefined}
        onClose={() => setModalOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
