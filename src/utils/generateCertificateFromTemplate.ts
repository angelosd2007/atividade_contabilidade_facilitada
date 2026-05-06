import { PDFDocument, PDFFont, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const PDF_WIDTH = 640.32
const PDF_HEIGHT = 460.08
const IMAGE_HEIGHT = 1917
const PX_PER_PT = IMAGE_HEIGHT / PDF_HEIGHT // ~4.166

const BEGE = rgb(236 / 255, 233 / 255, 228 / 255)
const TEXT_BLACK = rgb(0, 0, 0)

const NAME_BASELINE_Y_PT = 252.08
const NAME_X_PT = 42
const NAME_SIZE_PT = 24

const COURSE_X_PT = px(170)
const COURSE_LINE1_BASELINE_PT = pyTopToBottom(1010)
const COURSE_LINE2_BASELINE_PT = pyTopToBottom(1090)
const COURSE_MAX_WIDTH_PT = px(2200 - 170)
const COURSE_SIZE_PT = 17

const DATE_X_PT = px(170)
const DATE_BASELINE_PT = pyTopToBottom(1310)
const DATE_SIZE_PT = 18

const COURSE_MASK = {
  x: px(125),
  y: pyTopToBottom(1130),
  width: px(2260 - 125),
  height: px(1130 - 920),
}

const DATE_MASK = {
  x: px(125),
  y: pyTopToBottom(1335),
  width: px(640 - 125),
  height: px(1335 - 1230),
}

let cachedAssets: Promise<{
  templateBytes: ArrayBuffer
  regularBytes: ArrayBuffer
  boldBytes: ArrayBuffer
}> | null = null

function loadAssets() {
  if (!cachedAssets) {
    cachedAssets = Promise.all([
      fetch(`${import.meta.env.BASE_URL}template-bg.jpg`).then(r => r.arrayBuffer()),
      fetch(`${import.meta.env.BASE_URL}fonts/Montserrat-Regular.ttf`).then(r => r.arrayBuffer()),
      fetch(`${import.meta.env.BASE_URL}fonts/Montserrat-Bold.ttf`).then(r => r.arrayBuffer()),
    ]).then(([templateBytes, regularBytes, boldBytes]) => ({
      templateBytes,
      regularBytes,
      boldBytes,
    }))
  }
  return cachedAssets
}

export type CertificateInput = {
  studentName: string
  courseName: string
  hours: string
  date: string
}

export async function generateCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const { studentName, courseName, hours, date } = input
  const formattedDate = date.replace(/\./g, '/')

  const { templateBytes, regularBytes, boldBytes } = await loadAssets()

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fontRegular = await pdfDoc.embedFont(regularBytes, { subset: true })
  const fontBold = await pdfDoc.embedFont(boldBytes, { subset: true })

  const templateImg = await pdfDoc.embedJpg(templateBytes)
  const page = pdfDoc.addPage([PDF_WIDTH, PDF_HEIGHT])
  page.drawImage(templateImg, { x: 0, y: 0, width: PDF_WIDTH, height: PDF_HEIGHT })

  page.drawRectangle({ ...COURSE_MASK, color: BEGE })
  page.drawRectangle({ ...DATE_MASK, color: BEGE })

  page.drawText(studentName, {
    x: NAME_X_PT,
    y: NAME_BASELINE_Y_PT,
    font: fontBold,
    size: NAME_SIZE_PT,
    color: TEXT_BLACK,
  })

  drawCoursePhrase({
    page,
    courseName,
    hours,
    fontRegular,
    fontBold,
  })

  page.drawText(formattedDate, {
    x: DATE_X_PT,
    y: DATE_BASELINE_PT,
    font: fontRegular,
    size: DATE_SIZE_PT,
    color: TEXT_BLACK,
  })

  return pdfDoc.save()
}

type CourseRun = { text: string; bold: boolean }

function drawCoursePhrase({
  page,
  courseName,
  hours,
  fontRegular,
  fontBold,
}: {
  page: ReturnType<PDFDocument['addPage']>
  courseName: string
  hours: string
  fontRegular: PDFFont
  fontBold: PDFFont
}) {
  const runs: CourseRun[] = [
    { text: 'completou com êxito o curso de ', bold: false },
    { text: `${courseName},`, bold: true },
    { text: ' com ', bold: false },
    { text: `${hours} horas`, bold: false },
    { text: ' de duração.', bold: false },
  ]

  const tokens: CourseRun[] = []
  for (const run of runs) {
    const parts = run.text.split(/(\s+)/)
    for (const p of parts) {
      if (p) tokens.push({ text: p, bold: run.bold })
    }
  }

  const widthOf = (t: string, bold: boolean) =>
    (bold ? fontBold : fontRegular).widthOfTextAtSize(t, COURSE_SIZE_PT)

  const lines: CourseRun[][] = [[]]
  let lineWidth = 0
  for (const tok of tokens) {
    const tw = widthOf(tok.text, tok.bold)
    const isWhitespace = /^\s+$/.test(tok.text)
    const wouldOverflow = lineWidth + tw > COURSE_MAX_WIDTH_PT
    const lineNotEmpty = lines[lines.length - 1].length > 0

    if (wouldOverflow && lineNotEmpty) {
      lines.push([])
      lineWidth = 0
      if (isWhitespace) continue
    }
    lines[lines.length - 1].push(tok)
    lineWidth += tw
  }

  const baselines = [COURSE_LINE1_BASELINE_PT, COURSE_LINE2_BASELINE_PT]
  for (let i = 0; i < lines.length && i < baselines.length; i++) {
    let x = COURSE_X_PT
    for (const tok of lines[i]) {
      page.drawText(tok.text, {
        x,
        y: baselines[i],
        font: tok.bold ? fontBold : fontRegular,
        size: COURSE_SIZE_PT,
        color: TEXT_BLACK,
      })
      x += widthOf(tok.text, tok.bold)
    }
  }
}

function px(imagePx: number) {
  return imagePx / PX_PER_PT
}

function pyTopToBottom(imageYTop: number) {
  return PDF_HEIGHT - imageYTop / PX_PER_PT
}
