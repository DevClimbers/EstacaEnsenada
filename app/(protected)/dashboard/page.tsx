import { createClient } from '@/lib/supabase/server'
import { format, addDays } from 'date-fns'
import type { Entrevista, Compromiso, Perfil, Reunion } from '@/lib/types'
import { TIPO_ENTREVISTA_LABELS } from '@/lib/types'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { FocoSemana } from '@/components/dashboard/FocoSemana'
import { ProximaReunionCard } from '@/components/dashboard/ProximaReunionCard'
import { CargaCard } from '@/components/dashboard/CargaCard'
import { UnidadesCard } from '@/components/dashboard/UnidadesCard'
import { ActividadCard } from '@/components/dashboard/ActividadCard'
import { Donut } from '@/components/dashboard/Donut'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const TONE_PALETTE = ['#1B2A5E', '#2F4D8C', '#C9A84C', '#3D6FA8']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hoy  = format(new Date(), 'yyyy-MM-dd')
  const en7  = format(addDays(new Date(), 7), 'yyyy-MM-dd')
  const now  = new Date()

  // ─── Fetch everything in parallel ─────────────────────────────
  const [
    { data: perfilesRaw },
    { data: reunionRaw },
    { data: entrevistasRaw },
    { data: compromisosRaw },
    { data: unidadesRaw },
  ] = await Promise.all([
    supabase
      .from('crm_perfiles')
      .select('id, nombre, rol')
      .order('rol'),
    supabase
      .from('crm_reuniones')
      .select('*')
      .eq('archivado', false)
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('crm_entrevistas')
      .select('id, nombre_miembro, tipo, estado, fecha_agendada, asignado_a, unidad_id, updated_at')
      .eq('archivado', false),
    supabase
      .from('crm_compromisos')
      .select('id, titulo, estado, prioridad, fecha_limite, asignado_a, updated_at')
      .eq('archivado', false),
    supabase
      .from('crm_unidades')
      .select('id, nombre')
      .order('nombre'),
  ])

  type EntRow = Pick<Entrevista, 'id' | 'nombre_miembro' | 'tipo' | 'estado' | 'fecha_agendada' | 'asignado_a' | 'unidad_id' | 'updated_at'>
  type CompRow = Pick<Compromiso, 'id' | 'titulo' | 'estado' | 'prioridad' | 'fecha_limite' | 'asignado_a' | 'updated_at'>
  type ProfRow = Pick<Perfil, 'id' | 'nombre' | 'rol'>

  const ents  = (entrevistasRaw  ?? []) as EntRow[]
  const comps = (compromisosRaw  ?? []) as CompRow[]
  const profs = (perfilesRaw     ?? []) as ProfRow[]
  const unis  = (unidadesRaw     ?? []) as Array<{ id: string; nombre: string }>

  // ─── KPIs ─────────────────────────────────────────────────────
  const entTotal      = ents.length
  const entRealizadas = ents.filter(e => e.estado === 'realizada').length
  const entAgendadas  = ents.filter(e => e.estado === 'agendada').length
  const entPendientes = ents.filter(e => e.estado === 'pendiente').length
  const coberturaEnt  = entTotal > 0 ? Math.round((entRealizadas / entTotal) * 100) : 0

  const compActivos  = comps.filter(c => ['pendiente', 'en_progreso'].includes(c.estado)).length
  const compHechos   = comps.filter(c => c.estado === 'completado').length
  const compVencidos = comps.filter(c =>
    ['pendiente', 'en_progreso'].includes(c.estado) &&
    c.fecha_limite !== null &&
    c.fecha_limite < hoy
  ).length
  const tasaCumpl = (compActivos + compHechos) > 0
    ? Math.round((compHechos / (compActivos + compHechos)) * 100)
    : 0

  // Sparklines: count realizadas/completados per day over last 7 days
  const sparkEnt = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(now, -(6 - i)), 'yyyy-MM-dd')
    return ents.filter(e => e.estado === 'realizada' && e.updated_at.startsWith(d)).length
  })
  const sparkComp = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(now, -(6 - i)), 'yyyy-MM-dd')
    return comps.filter(c => c.estado === 'completado' && c.updated_at.startsWith(d)).length
  })

  // ─── Lookup maps ─────────────────────────────────────────────
  const profMap = new Map(profs.map(p => [p.id, p]))
  const uniMap  = new Map(unis.map(u => [u.id, u.nombre]))

  const tono = (asignadoA: string | null): string => {
    if (!asignadoA) return '#9C9A91'
    const idx = profs.findIndex(p => p.id === asignadoA)
    return idx >= 0 ? (TONE_PALETTE[idx % TONE_PALETTE.length] ?? '#9C9A91') : '#9C9A91'
  }

  // ─── Foco de la semana (next 7 days) ─────────────────────────
  const focoItems = [
    ...ents
      .filter(e => e.estado === 'agendada' && e.fecha_agendada !== null)
      .flatMap(e => {
        const fecha = e.fecha_agendada!.substring(0, 10)
        if (fecha < hoy || fecha > en7) return []
        const hora = e.fecha_agendada!.length > 10 ? e.fecha_agendada!.substring(11, 16) : null
        return [{
          kind: 'entrevista' as const,
          id: e.id,
          titulo: e.nombre_miembro,
          sub: TIPO_ENTREVISTA_LABELS[e.tipo],
          fecha,
          hora: hora && hora !== '00:00' ? hora : null,
          href: `/entrevistas/${e.id}`,
          prioridad: null,
          perfil: e.asignado_a && profMap.has(e.asignado_a)
            ? { nombre: profMap.get(e.asignado_a)!.nombre }
            : null,
        }]
      }),
    ...comps
      .filter(c => c.fecha_limite && c.fecha_limite >= hoy && c.fecha_limite <= en7 &&
        ['pendiente', 'en_progreso'].includes(c.estado))
      .map(c => ({
        kind: 'compromiso' as const,
        id: c.id,
        titulo: c.titulo,
        sub: c.estado === 'en_progreso' ? 'En progreso' : 'Pendiente',
        fecha: c.fecha_limite!,
        hora: null,
        href: '/compromisos',
        prioridad: c.prioridad,
        perfil: c.asignado_a && profMap.has(c.asignado_a)
          ? { nombre: profMap.get(c.asignado_a)!.nombre }
          : null,
      })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha))

  // ─── Carga por dirigente ──────────────────────────────────────
  const cargaItems = profs
    .filter(p => p.rol !== 'secretario')
    .map(p => ({
      perfil: p,
      entActivas:  ents.filter(e => e.asignado_a === p.id && ['agendada', 'pendiente'].includes(e.estado)).length,
      compActivos: comps.filter(c => c.asignado_a === p.id && ['pendiente', 'en_progreso'].includes(c.estado)).length,
      hechos:      ents.filter(e => e.asignado_a === p.id && e.estado === 'realizada').length,
    }))
    .sort((a, b) => (b.entActivas + b.compActivos) - (a.entActivas + a.compActivos))
    .slice(0, 4)

  // ─── Entrevistas por unidad ───────────────────────────────────
  const uniGroup: Record<string, { realizadas: number; pendientes: number }> = {}
  for (const e of ents) {
    if (!e.unidad_id) continue
    if (!uniGroup[e.unidad_id]) uniGroup[e.unidad_id] = { realizadas: 0, pendientes: 0 }
    if (e.estado === 'realizada') uniGroup[e.unidad_id].realizadas++
    else if (['pendiente', 'agendada'].includes(e.estado)) uniGroup[e.unidad_id].pendientes++
  }
  const unidadRows = Object.entries(uniGroup)
    .map(([id, g]) => ({
      id,
      nombre: uniMap.get(id) ?? id,
      realizadas: g.realizadas,
      pendientes: g.pendientes,
      total: g.realizadas + g.pendientes,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  // ─── Actividad reciente ───────────────────────────────────────
  const actividadItems = [
    ...ents
      .filter(e => e.updated_at)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 8)
      .map(e => ({
        id: 'ent-' + e.id,
        ts: e.updated_at,
        actorNombre: profMap.get(e.asignado_a ?? '')?.nombre ?? 'Sistema',
        verbo: e.estado === 'realizada' ? 'realizó entrevista a' : 'actualizó entrevista de',
        objeto: e.nombre_miembro,
        tono: tono(e.asignado_a),
      })),
    ...comps
      .filter(c => c.updated_at)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 8)
      .map(c => ({
        id: 'comp-' + c.id,
        ts: c.updated_at,
        actorNombre: profMap.get(c.asignado_a ?? '')?.nombre ?? 'Sistema',
        verbo: c.estado === 'completado' ? 'completó' : 'actualizó compromiso',
        objeto: c.titulo,
        tono: tono(c.asignado_a),
      })),
  ]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 10)

  // ─── Saludo personalizado ─────────────────────────────────────
  const miPerfil  = profs.find(p => p.id === user!.id)
  const apellido  = miPerfil?.nombre.split(' ').pop() ?? ''
  const rolLabel  = miPerfil?.rol === 'presidente' ? 'Presidente' : 'Consejero'
  const saludo    = miPerfil ? `${greeting()}, ${rolLabel} ${apellido}` : greeting()

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 10.5, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#9C9A91', fontWeight: 600,
        }}>
          Panel de control
        </div>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: '#0E1018',
          letterSpacing: '-0.025em', margin: '4px 0 0', lineHeight: 1.2,
        }}>
          {saludo}
        </h1>
      </div>

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <KpiCard
          kicker="Entrevistas"
          value={entRealizadas}
          suffix={`/ ${entTotal}`}
          sub={`${entAgendadas} agendadas · ${entPendientes} pendientes`}
          sparkline={sparkEnt}
          tone="navy"
        />
        <KpiCard
          kicker="Compromisos activos"
          value={compActivos}
          sub={`${compVencidos} vencidos · ${compHechos} completados`}
          sparkline={sparkComp}
          tone={compVencidos > 0 ? 'red' : 'gold'}
        />
        <KpiCard
          kicker="Cobertura entrevistas"
          value={coberturaEnt}
          suffix="%"
          sub={`${entRealizadas} de ${entTotal} entrevistas realizadas`}
          tone="green"
          accent={<Donut value={coberturaEnt} size={52} stroke={7} color="#1E6B3A" />}
        />
        <KpiCard
          kicker="Tasa cumplimiento"
          value={tasaCumpl}
          suffix="%"
          sub={`${compHechos} completados de ${compActivos + compHechos}`}
          tone="gold"
          accent={<Donut value={tasaCumpl} size={52} stroke={7} color="#C9A84C" />}
        />
      </div>

      {/* ── Main two-column layout ───────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 20,
        alignItems: 'start',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FocoSemana items={focoItems} today={hoy} />
          {unidadRows.length > 0 && <UnidadesCard rows={unidadRows} />}
          <ActividadCard items={actividadItems} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProximaReunionCard reunion={reunionRaw as Reunion | null} />
          {cargaItems.length > 0 && <CargaCard items={cargaItems} />}
        </div>
      </div>
    </div>
  )
}
