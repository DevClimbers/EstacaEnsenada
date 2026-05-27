'use client'

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { EventPill } from './EventPill'
import type { CalendarEvent } from '@/app/api/calendario/route'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDay: Date | null
  onSelectDay: (day: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function WeekView({
  currentDate,
  events,
  selectedDay,
  onSelectDay,
  onEventClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  function eventsForDay(day: Date) {
    const key = format(day, 'yyyy-MM-dd')
    return events.filter((e) => e.fecha === key)
  }

  const totalEvents = events.length

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-white z-10">
        {days.map((day) => {
          const today = isToday(day)
          const selected = selectedDay ? isSameDay(day, selectedDay) : false
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                'py-3 flex flex-col items-center gap-0.5 hover:bg-gray-50 transition-colors',
                selected && 'bg-blue-50',
              )}
            >
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {format(day, 'EEE', { locale: es })}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold w-9 h-9 flex items-center justify-center rounded-full',
                  today && 'bg-[#C9A84C] text-white',
                  !today && 'text-gray-800',
                )}
              >
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Event grid */}
      {totalEvents === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Sin eventos esta semana</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100">
          {days.map((day) => {
            const dayEvents = eventsForDay(day)
            const selected = selectedDay ? isSameDay(day, selectedDay) : false

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDay(day)}
                className={cn(
                  'p-2 space-y-1 cursor-pointer min-h-[200px]',
                  selected && 'bg-blue-50',
                  !selected && 'hover:bg-gray-50 transition-colors',
                )}
              >
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center pt-4">—</p>
                ) : (
                  dayEvents.map((event) => (
                    <EventPill
                      key={event.id}
                      event={event}
                      compact
                      onClick={() => onEventClick(event)}
                    />
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
