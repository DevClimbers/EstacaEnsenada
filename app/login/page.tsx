import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B2A5E] px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Encabezado */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">PE</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Presidencia de Estaca
          </h1>
          <p className="mt-1 text-sm text-blue-200">Ensenada México</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Iniciar sesión
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
