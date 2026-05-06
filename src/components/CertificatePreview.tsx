import { useEffect, useRef, useState } from 'react'
import type { CourseParams } from '../hooks/useQueryParams'
import { generateCertificatePdf } from '../utils/generateCertificateFromTemplate'

type Props = {
  course: CourseParams
  studentName: string
  onBack: () => void
}

type PdfState =
  | { status: 'loading' }
  | { status: 'ready'; blobUrl: string; bytes: Uint8Array }
  | { status: 'error'; message: string }

export function CertificatePreview({ course, studentName, onBack }: Props) {
  const [pdf, setPdf] = useState<PdfState>({ status: 'loading' })
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setPdf({ status: 'loading' })

    generateCertificatePdf({
      studentName,
      courseName: course.curso,
      hours: course.horas,
      date: course.data,
    })
      .then((bytes) => {
        if (cancelled) return
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url
        setPdf({ status: 'ready', blobUrl: url, bytes })
      })
      .catch((err) => {
        console.error('Falha ao gerar PDF:', err)
        if (!cancelled) setPdf({ status: 'error', message: String(err?.message ?? err) })
      })

    return () => {
      cancelled = true
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [course.curso, course.data, course.horas, studentName])

  function handleDownload() {
    if (pdf.status !== 'ready') return
    const slug = slugify(studentName) || 'certificado'
    const a = document.createElement('a')
    a.href = pdf.blobUrl
    a.download = `certificado-${slug}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
            >
              ← Voltar e editar dados
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
              Pré-visualização do certificado
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Confira os dados antes de baixar. O preview abaixo é o PDF exato gerado.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={pdf.status !== 'ready'}
            className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 active:bg-slate-950 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-wait"
          >
            {pdf.status === 'loading' ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>

        <div
          className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden mx-auto relative"
          style={{ aspectRatio: '640.32 / 460.08' }}
        >
          {pdf.status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              Gerando certificado...
            </div>
          )}
          {pdf.status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center text-red-600 px-4 text-center">
              Não foi possível gerar o PDF: {pdf.message}
            </div>
          )}
          {pdf.status === 'ready' && (
            <iframe
              key={pdf.blobUrl}
              src={`${pdf.blobUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Pré-visualização do certificado"
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
