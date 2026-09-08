import { createClient } from '@/lib/supabase/client'

/** Bucket público de Supabase Storage para imágenes de agendas (ver migración 002) */
export const AGENDAS_BUCKET = 'agendas'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB — coincide con file_size_limit del bucket
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * Devuelve la función `uploadFile` que BlockNote invoca al insertar,
 * pegar o arrastrar una imagen en el editor. Sube el archivo a
 * Storage bajo `agendas/<reunionId>/<uuid>.<ext>` y regresa su URL pública,
 * que queda guardada dentro del JSON de la agenda.
 */
export function crearUploadFile(reunionId: string) {
  return async function uploadFile(file: File): Promise<string> {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      throw new Error('Solo se pueden adjuntar imágenes JPG, PNG, GIF o WebP')
    }
    if (file.size > MAX_BYTES) {
      throw new Error('La imagen supera el límite de 10 MB')
    }

    const ext = extensionDe(file)
    const path = `${reunionId}/${crypto.randomUUID()}.${ext}`

    const supabase = createClient()
    const { error } = await supabase.storage.from(AGENDAS_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

    if (error) {
      throw new Error(`No se pudo subir la imagen: ${error.message}`)
    }

    const { data } = supabase.storage.from(AGENDAS_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }
}

function extensionDe(file: File): string {
  const porTipo: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  }
  return porTipo[file.type] ?? 'jpg'
}
