'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Mail, Shield, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { ROL_LABELS } from '@/lib/types'
import type { Perfil } from '@/lib/types'

interface PerfilFormProps {
  perfil: Perfil
  email: string
}

export function PerfilForm({ perfil, email }: PerfilFormProps) {
  const [nombre, setNombre] = useState(perfil.nombre)
  const [savingNombre, setSavingNombre] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveNombre(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || nombre.trim() === perfil.nombre) return
    setSavingNombre(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('crm_perfiles')
      .update({ nombre: nombre.trim() })
      .eq('id', perfil.id)

    setSavingNombre(false)
    if (error) {
      toast.error('Error al guardar el nombre')
    } else {
      toast.success('Nombre actualizado')
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (!newPassword || newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setSavingPassword(true)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setSavingPassword(false)

    if (error) {
      toast.error(error.message ?? 'Error al cambiar la contraseña')
    } else {
      toast.success('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Info de cuenta — solo lectura */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4 text-[#C9A84C]" />
          Información de cuenta
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Correo electrónico</p>
              <p className="text-sm font-medium text-gray-900">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Rol</p>
              <p className="text-sm font-medium text-gray-900">
                {ROL_LABELS[perfil.rol]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editar nombre */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[#C9A84C]" />
          Nombre para mostrar
        </h2>

        <form onSubmit={handleSaveNombre} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              disabled={savingNombre}
            />
          </div>
          <Button
            type="submit"
            className="bg-[#1B2A5E] hover:bg-[#243578] text-white"
            disabled={savingNombre || !nombre.trim() || nombre.trim() === perfil.nombre}
          >
            {savingNombre ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando…</>
            ) : (
              'Guardar nombre'
            )}
          </Button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-[#C9A84C]" />
          Cambiar contraseña
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              disabled={savingPassword}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              disabled={savingPassword}
              autoComplete="new-password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          <Button
            type="submit"
            className="bg-[#1B2A5E] hover:bg-[#243578] text-white"
            disabled={
              savingPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 8
            }
          >
            {savingPassword ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cambiando…</>
            ) : (
              'Cambiar contraseña'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
