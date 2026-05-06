# Gerador de Certificados — Contabilidade Facilitada

Aplicação web para emissão dinâmica de certificados de conclusão de curso.
Os dados do curso vêm via query params da URL; o aluno preenche nome e e-mail
no formulário e baixa o certificado em PDF, fiel ao modelo institucional.

> **Desafio técnico** — Vaga de Analista de IA Aplicada,
> Contabilidade Facilitada Educacional Ltda.

## Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS** para o form e a UI auxiliar
- **`pdf-lib`** + **`@pdf-lib/fontkit`** para geração do PDF
- **Montserrat** (Regular + Bold, TTF embutido) como tipografia dos campos dinâmicos

## Estratégia de fidelidade visual

O critério #1 de avaliação é fidelidade visual ao modelo. Em vez de reconstruir
o layout do certificado em HTML/SVG e capturar com html2canvas — caminho que
inevitavelmente diverge do template em pixel/peso/espaçamento —, esta aplicação
usa o **próprio template como camada de fundo** e só sobrepõe os campos
dinâmicos:

1. O `Template - Certificado.pdf` original tem toda a arte (moldura, diagonal
   navy, selos dourados, marca d'água do caduceu, assinatura, textos
   institucionais) rasterizada em uma única imagem JPG embutida.
2. Extraímos esse JPG para `public/template-bg.jpg` e o usamos como fundo.
3. Mascaramos com retângulos cor-de-bege (`#ECE9E4`, sampleada do fundo real)
   as 2 áreas que têm texto rasterizado a substituir (frase do curso + data).
4. Sobrepomos os 4 campos dinâmicos como texto vetorial via `pdf-lib`,
   com Montserrat embutida em coordenadas calibradas a partir do PDF original.

Resultado: o PDF baixado é byte-a-byte o mesmo conteúdo mostrado no preview, e
fundo/selos/assinatura/diagonal vêm intactos do template oficial.

## Contrato da URL

```
?curso=<nome+do+curso>&horas=<NN>&data=<DD.MM.AAAA>
```

| Param | Tipo | Exemplo |
|-------|------|---------|
| `curso` | string (URL-encoded, aceita acentos) | `Reforma+Tribut%C3%A1ria` |
| `horas` | string numérica | `06` |
| `data` | string `DD.MM.AAAA` | `17.04.2026` |

Se algum parâmetro estiver ausente, é exibida uma tela orientando o aluno a
contatar o time de CRM.

### Exemplo

```
http://localhost:5173/?curso=Curso+Avan%C3%A7ado+de+Reforma+Tribut%C3%A1ria&horas=06&data=17.04.2026
```

## Como rodar localmente

Pré-requisito: **Node.js 20+**.

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build        # gera ./dist
npm run preview      # serve o build localmente
```

### Deploy na Vercel

1. Conectar este repositório na Vercel
2. **Framework preset**: Vite (auto-detectado)
3. **Build command**: `npm run build`
4. **Output directory**: `dist`
5. Deploy automático a cada push

## Estrutura

```
src/
├── components/
│   ├── CertificatePreview.tsx   # Gera PDF on-mount, mostra em iframe, dispara download
│   ├── StudentForm.tsx          # Formulário nome + e-mail + validações
│   └── InvalidUrlScreen.tsx     # Tela de erro para URL incompleta
├── hooks/
│   └── useQueryParams.ts        # Lê e valida ?curso=&horas=&data=
├── utils/
│   ├── formatDate.ts            # DD.MM.AAAA → DD/MM/AAAA
│   └── generateCertificateFromTemplate.ts  # pdf-lib + JPG + máscaras + texto
├── App.tsx                      # Roteamento entre telas
├── main.tsx
└── index.css                    # Tailwind base

public/
├── template-bg.jpg              # JPG 2668×1917 extraído do template original
└── fonts/
    ├── Montserrat-Regular.ttf
    └── Montserrat-Bold.ttf
```

## Decisões de projeto

**Privacidade do e-mail.** O e-mail é capturado, validado client-side e
logado no console apenas para fins de debug local. Não é persistido em
storage do navegador, não é enviado a nenhum servidor (a aplicação é puramente
front-end). Há aviso explícito de LGPD no formulário.

**Por que `pdf-lib` em vez de html2canvas + jsPDF.** Capturar HTML como
imagem traz toda a divergência da reconstrução visual de volta para o PDF.
Com `pdf-lib`, o template é a fonte da verdade e o texto vetorial preserva
seleção/zoom no PDF final.

**Por que Montserrat.** É a fonte livre (Google Fonts) que mais se aproxima
visualmente da fonte original do template. Embutimos os arquivos TTF para
não depender de CDN externa.

## URL de produção

A definir após primeiro deploy na Vercel.
