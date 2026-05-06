import { useState, type FormEvent } from 'react'
import type { CourseParams } from '../hooks/useQueryParams'
import { formatDate } from '../utils/formatDate'

type Props = {
  course: CourseParams
  onSubmit: (data: { name: string; email: string }) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function StudentForm({ course, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (trimmedName.length < 2) nextErrors.name = 'Informe seu nome completo.'
    if (!EMAIL_REGEX.test(trimmedEmail)) nextErrors.email = 'E-mail inválido.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ name: trimmedName, email: trimmedEmail })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Contabilidade Facilitada
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Emita seu certificado
          </h1>
          <p className="mt-3 text-slate-600">
            Preencha seus dados para gerar o certificado de conclusão do curso{' '}
            <strong>{course.curso}</strong> ({course.horas} horas, concluído em{' '}
            {formatDate(course.data)}).
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition"
              placeholder="Como deve aparecer no certificado"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1.5 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition"
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Seus dados são utilizados apenas para emissão do certificado nesta
            sessão e não são armazenados em nenhum servidor.
          </p>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 active:bg-slate-950 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            Gerar certificado
          </button>
        </form>
      </div>
    </div>
  )
}
