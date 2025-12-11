export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Recuperar senha
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Esta funcionalidade será implementada em breve.
        </p>
        <a
          href="/login"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          Voltar para login
        </a>
      </div>
    </main>
  )
}



