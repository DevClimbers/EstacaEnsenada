/** Colores de cursor por usuario (estables por id). */
const PALETA = ['#1B2A5E', '#C9A84C', '#2E7D32', '#C62828', '#6A1B9A', '#00838F', '#EF6C00', '#AD1457']

export function colorDeUsuario(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETA[h % PALETA.length]
}
