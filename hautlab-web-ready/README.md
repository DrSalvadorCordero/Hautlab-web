# Hautlab Web — Dr. Salvador Cordero

Proyecto Next.js para una web médica premium orientada a conversión, privacidad y rendimiento.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Preparado para Vercel
- Google Analytics, Google Ads y Meta Pixel con consentimiento
- CTA de WhatsApp con mensaje precargado
- Asistente virtual de recepción mediante OpenAI Responses API

## Primeros pasos

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Variables de entorno

Configura en `.env.local` y en Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://www.hautlabmx.com
NEXT_PUBLIC_WHATSAPP_NUMBER=529992809758
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-GJ8ZHDB9YM
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-11350888428
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_LEAD=
NEXT_PUBLIC_META_PIXEL_ID=849809287547294
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=

OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-5.6-luna
```

`OPENAI_API_KEY` es exclusivamente de servidor. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni incluirse en código, capturas o commits.

## Asistente virtual

El asistente está disponible globalmente desde `components/assistant/ai-reception-assistant.tsx` y consume `POST /api/assistant`.

Controles implementados:

- Base de conocimiento aprobada en `lib/assistant-knowledge.ts`.
- No diagnostica, prescribe ni promete resultados.
- No solicita datos de salud, documentos o fotografías.
- Conversación mantenida únicamente en memoria del navegador durante la visita.
- Solicitudes a OpenAI con `store: false`.
- Validación de entrada, límite de longitud, origen permitido y rate limit básico.
- Escalamiento inmediato ante frases compatibles con urgencia.
- Traspaso a WhatsApp con un resumen que la persona decide enviar.
- Eventos de apertura, mensaje y traspaso sujetos al consentimiento analítico ya existente.

El rate limit en memoria es una primera barrera para Vercel. Para tráfico alto debe sustituirse por un almacén compartido como Redis/Upstash.

## Validación

```bash
npm run type-check
npm run lint
npm run build
npm run smoke-test
```

## Deploy en Vercel

1. Importar el repositorio.
2. Establecer `hautlab-web-ready` como Root Directory.
3. Configurar las variables de entorno.
4. Revisar el despliegue de Preview.
5. Hacer merge únicamente después de aprobar la revisión.

## Uso con Codex

Pedirle a Codex que lea primero:

- `docs/BRAND.md`
- `docs/CODEX-INSTRUCTIONS.md`
- `docs/ADS-TRACKING.md`
- `docs/WHATSAPP-FLOW.md`

Después trabajar por tickets.
