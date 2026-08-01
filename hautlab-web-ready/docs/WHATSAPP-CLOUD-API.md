# WhatsApp Cloud API — configuración de producción

## Recurso oficial

- Meta App ID: `1277545887579303`
- Endpoint de webhook: `https://www.hautlabmx.com/api/whatsapp/webhook`
- Campo mínimo de suscripción: `messages`

## Variables obligatorias en Vercel

Configurar únicamente como variables cifradas de Production, Preview y Development cuando corresponda:

```text
META_APP_ID=1277545887579303
WHATSAPP_VERIFY_TOKEN=<valor aleatorio largo compartido con Meta>
META_APP_SECRET=<App Secret de Meta>
WHATSAPP_PHONE_NUMBER_ID=<Phone Number ID>
WHATSAPP_BUSINESS_ACCOUNT_ID=<WABA ID>
WHATSAPP_ACCESS_TOKEN=<token permanente de System User>
```

Nunca almacenar secretos, tokens o datos de pacientes en GitHub.

## Verificación

La ruta `GET /api/whatsapp/webhook`:

1. Compara `hub.verify_token` mediante comparación de tiempo constante.
2. Devuelve `hub.challenge` cuando la solicitud es válida.
3. Devuelve un estado sanitario sin revelar secretos cuando se consulta sin parámetros.

La ruta `POST /api/whatsapp/webhook`:

1. Exige la firma `x-hub-signature-256`.
2. Verifica la firma HMAC SHA-256 con `META_APP_SECRET`.
3. Rechaza solicitudes no firmadas o alteradas.
4. Registra únicamente métricas agregadas; no guarda nombres, teléfonos, texto, imágenes ni contenido clínico.
5. Responde `200` después de validar el evento.

## Prueba de aceptación

1. Abrir el endpoint sin parámetros y confirmar `status: ok`.
2. Confirmar que `metaAppId`, `verifyToken` y `appSecret` aparezcan en `true`.
3. Verificar la URL desde Meta for Developers usando el mismo `WHATSAPP_VERIFY_TOKEN`.
4. Suscribir el campo `messages`.
5. Enviar un mensaje real al número conectado.
6. Confirmar en Vercel un evento `[whatsapp-webhook] verified event` sin datos personales.

## Restricción arquitectónica

El proyecto de producción válido es `hautlabmx.com`. El proyecto duplicado `hautlab-wa-command-center` está configurado para cancelar despliegues del repositorio público y no debe utilizarse como callback de Meta.
