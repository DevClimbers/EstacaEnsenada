'use client'

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { EventPill } from './EventPill'
import type { CalendarEvent } from '@/app/api/calendario/route'

const DAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MAX_VISIBLE = 3

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDay: Date | null
  onSelectDay: (day: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({
  currentDate,
  events,
  selectedDay,
  onSelectDay,
  onEventClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function eventsForDay(day: Date) {
    const key = format(day, 'yyyy-MM-dd')
    return events.filter((e) => e.fecha === key)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${days.length / 7}, 1fr)` }}>
        {days.map((day) => {
          const dayEvents = eventsForDay(day)
          const visible = dayEvents.slice(0, MAX_VISIBLE)
          const overflow = dayEvents.length - MAX_VISIBLE
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const selected = selectedDay ? isSameDay(day, selectedDay) : false

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                'border-b border-r border-gray-100 p-1 cursor-pointer transition-colors min-h-[90px]',
                !inMonth && 'bg-gray-50/50',
                selected && 'bg-blue-50',
                inMonth && !selected && 'hover:bg-gray-50',
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-end mb-1 px-0.5">
                <span
                  className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    today && 'bg-[#C9A84C] text-white font-bold',
                    !today && inMonth && 'text-gray-800',
                    !today && !inMonth && 'text-gray-300',
                    selected && !today && 'text-[#1B2A5E]',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {visible.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    compact
                    onClick={() => onEventClick(event)}
                  />
                ))}
                {overflow > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectDay(day) }}
                    className="w-full text-left text-[10px] text-gray-500 hover:text-gray-700 px-1.5"
                  >
                    +{overflow} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
