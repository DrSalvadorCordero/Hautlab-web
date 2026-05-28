# Hautlab Web — Dr. Salvador Cordero

Proyecto base Next.js para una web premium de dermatología clínica y medicina estética.

## Stack

- Next.js
- TypeScript
- CSS global sin dependencias visuales innecesarias
- Preparado para Vercel
- Preparado para Meta Pixel y Google Tag
- CTA WhatsApp con mensaje precargado

## Primeros pasos

```bash
npm install
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configura:

```env
NEXT_PUBLIC_SITE_URL=https://hautlabmx.com
NEXT_PUBLIC_WHATSAPP_NUMBER=529999999999
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_TAG_ID=
```

## Deploy en Vercel

1. Subir este proyecto a GitHub.
2. Entrar a Vercel.
3. Importar repositorio.
4. Configurar variables de entorno.
5. Deploy.

## Uso con Codex

Pedirle a Codex que lea primero:

- `docs/BRAND.md`
- `docs/CODEX-INSTRUCTIONS.md`
- `docs/ADS-TRACKING.md`
- `docs/WHATSAPP-FLOW.md`

Después trabajar por tickets.

Ejemplo:

```txt
Lee /docs/CODEX-INSTRUCTIONS.md y audita la versión mobile. Corrige solo espaciado, jerarquía visual y CTAs. No cambies el posicionamiento ni el copy principal.
```
