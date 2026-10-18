# Tracking

## Eventos requeridos

1. Click en WhatsApp.
2. Envío de formulario.
3. Vista de página de gracias.
4. Click en llamada, si se agrega.
5. Click en ubicación, si se agrega.

## Eventos sugeridos Meta

- PageView
- Lead
- Contact
- Schedule
- whatsapp_click como evento custom

## Eventos sugeridos Google Ads

- whatsapp_click
- lead_submit
- contact_click

## Reglas

- Nunca colocar claves privadas en frontend.
- Los IDs públicos de Pixel y Google Tag pueden vivir en variables públicas `NEXT_PUBLIC_*`.
- Mantener eventos simples y verificables.
- Documentar cualquier evento nuevo en este archivo.


## Auditoría de medición, 18 de octubre de 2026

Se comprobó que la propiedad GA4 accesible en el conector de analítica no devolvía
sesiones ni vistas de página para 18/09–17/10/2026, ni registros históricos.
Esto NO demuestra ausencia de visitantes; el flujo a la propiedad puede estar
desconectado, faltar consentimiento o no corresponder a su stream web.

En el despliegue Vercel se verificó que no había variable de entorno
`NEXT_PUBLIC_GA4_MEASUREMENT_ID`. El frontend utilizaba el identificador
de respaldo del repositorio, `G-GJ8ZHDB9YM`. **No hay evidencia todavía de que
sea el ID de la corriente web de la propiedad GA4 consultada.**
La corrección de cobertura no sustituye esa verificación.

### Implementación

- El tracking usa ahora `isPublicAnalyticsPath` para registrar páginas
  públicas del Journal, procedimientos, Mérida, agenda y contacto, sujetas
  siempre al consentimiento previo.
- Se excluyen las áreas `/private-care`, `/admin`, `/mi-hautlab`,
  `/seguimiento`, `/api`, `/pagos/resultado`,
  `/experiencia/mi-plan` y `/plan`: podrían contener datos sanitarios,
  transacciones, parámetros de acceso o preferencias sensibles.
- `page_location` contiene únicamente esquema, host y ruta; nunca query,
  fragmento, token, identificador de paciente ni datos escritos en formularios.
- Los eventos son `page_view`, `whatsapp_click`, `generate_lead`,
  `form_submit`, `phone_click`, `maps_click`, `payment_click` y
  `begin_checkout` según acción. Un clic es una intención, **no una cita
  confirmada**.
- Vercel Analytics y Speed Insights se montan solo tras aceptar el
  consentimiento en páginas públicas; se retiran al rechazarlo.
- Pruebas automáticas de rutas públicas, exclusiones clínicas y URL sanitizada
  forman parte de `npm run type-check`.

### Pendiente de verificación externa

1. Revisar en Google Analytics > Administrar > Flujos de datos > Web el
   **Measurement ID** de la propiedad real de hautlabmx.com. Confirmarlo
   contra `G-GJ8ZHDB9YM`; si es diferente, establecer el ID correcto en la
   variable de Vercel `NEXT_PUBLIC_GA4_MEASUREMENT_ID` para producción,
   publicar una nueva versión y probar DebugView/Realtime tras consentir.
2. Vercel Web Analytics está **desactivado** para este proyecto: el endpoint
   respondió `web_analytics_not_enabled`. Su activación debe efectuarse
   en el panel de Vercel, ya que las acciones disponibles no exponen el control
   de habilitación de esta función. Hasta entonces no prometer estadísticas
   de usuarios únicos desde Vercel.
3. Contabilizar citas confirmadas requiere integración transaccional con Nimbo,
   no inferirlas a partir de clics o formularios.
4. Evitar generar falsas visitas de prueba en producción durante QA; usar
   DebugView/Realtime con sesión de prueba marcada cuando corresponda.
