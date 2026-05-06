type Props = {
  missing: string[]
}

export function InvalidUrlScreen({ missing }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto mb-5 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#92400E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Link de certificado inválido
        </h1>
        <p className="text-slate-600 mb-4">
          O link que você acessou está incompleto. Faltam os seguintes parâmetros
          na URL:
        </p>
        <ul className="text-sm text-slate-700 mb-5 inline-block text-left">
          {missing.map((m) => (
            <li key={m} className="font-mono">
              • <code className="bg-slate-100 px-1.5 py-0.5 rounded">{m}</code>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500">
          Solicite um novo link à equipe de atendimento da Contabilidade
          Facilitada.
        </p>
      </div>
    </div>
  )
}
