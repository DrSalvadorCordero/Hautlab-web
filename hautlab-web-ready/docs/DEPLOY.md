# Deploy en Vercel — Hautlab Web

## Introducción

Este documento explica cómo desplegar **Hautlab Web** en Vercel con la configuración correcta de variables de entorno.

## Requisitos previos

- Repositorio en GitHub (DrSalvadorCordero/Hautlab-web)
- Cuenta en [Vercel](https://vercel.com)
- Acceso a los datos de configuración (WhatsApp, Meta Pixel, Google Tag Manager)

## Paso 1: Conectar repositorio a Vercel

1. Inicia sesión en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona: `DrSalvadorCordero/Hautlab-web`
5. Click en **"Import"**

Vercel detectará automáticamente:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Paso 2: Configurar Environment Variables

Las variables de entorno **NO** se especifican en `vercel.json`. Se configuran manualmente en Vercel.

### Instrucciones:

1. En el proyecto de Vercel, navega a: **Settings → Environment Variables**
2. Agregá las siguientes variables (valores sin comillas):

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://hautlabmx.com` | URL del sitio en producción |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `529999999999` | Número de WhatsApp (formato internacional sin +) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `tu_pixel_id` | Facebook Pixel ID para tracking |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | `tu_gtag_id` | Google Analytics Tag ID |

**Importante:** 
- Las variables `NEXT_PUBLIC_*` son visibles en el cliente (navegador)
- No incluyas valores sensibles (contraseñas, API keys privadas) en estas variables
- Si necesitas variables privadas en el servidor, usa variables sin el prefijo `NEXT_PUBLIC_`

### Ejemplo de configuración:

```
NEXT_PUBLIC_SITE_URL = https://hautlabmx.com
NEXT_PUBLIC_WHATSAPP_NUMBER = 529999999999
NEXT_PUBLIC_META_PIXEL_ID = 123456789
NEXT_PUBLIC_GOOGLE_TAG_ID = G-XXXXXXXXXX
```

## Paso 3: Deploy

1. Después de configurar las variables, Vercel mostrará un botón **"Deploy"**
2. Click en **"Deploy"** para iniciar el build
3. Espera a que se complete (generalmente 2-5 minutos)
4. Una vez completado, accede a tu sitio en la URL que Vercel te proporciona

## Paso 4: Verificar el deploy

1. Abre tu sitio en navegador
2. Abre DevTools → **Console**
3. Verifica que no hay errores relacionados con variables de entorno
4. Prueba la funcionalidad de WhatsApp (si está integrada)

## Redeploy después de cambiar variables

Si cambias cualquier variable de entorno en Vercel:

1. Ve a **Deployments**
2. Selecciona el último deploy
3. Click en los tres puntos **"..."** → **"Redeploy"**

Vercel volverá a ejecutar el build con las nuevas variables.

## Solución de problemas

### "Variable de entorno no definida"
- Verifica que la variable esté en Vercel → Settings → Environment Variables
- Confirma que el nombre es exacto (case-sensitive)
- Realiza un redeploy

### WhatsApp no funciona
- Verifica que `NEXT_PUBLIC_WHATSAPP_NUMBER` tenga formato correcto: `529999999999` (sin +)
- Asegúrate de que sea un número válido

### Pixel de Meta o Google Analytics no registra datos
- Verifica que los IDs sean correctos en Vercel
- Abre DevTools → Network/Console para ver si hay errores
- Realiza un redeploy después de ingresar los IDs

## Variables locales (.env.local)

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Luego completa los valores:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=529999999999
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_TAG_ID=
```

Ejecuta:

```bash
npm install
npm run dev
```

Accede a `http://localhost:3000`

## Referencia: estructura de vercel.json

El archivo `vercel.json` en este proyecto contiene configuración mínima:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"]
}
```

- Las **variables de entorno se configuran SOLO en Vercel Dashboard**, no en este archivo
- Este archivo solo especifica cómo construir y ejecutar el proyecto

## Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Environment Variables en Vercel](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Última actualización:** 2026-05-28
**Proyecto:** Hautlab Web — Dr. Salvador Cordero
