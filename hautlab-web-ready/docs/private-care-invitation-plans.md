# Planes preparados antes del registro — Private Care

Los pacientes pueden recibir una invitación clínica cuando todavía no tienen una cuenta verificada. No se debe suponer su correo ni identificar su expediente únicamente por el nombre.

## Funcionamiento

- Una invitación individual emitida por el propietario identifica al futuro destinatario mediante su `invitation_id`.
- Los borradores pueden guardarse en `private_care_prepared_plans` en Supabase, exclusivamente por procesos clínicos autorizados; **los datos médicos jamás van al repositorio**.
- Los borradores pueden ser revisados por el propietario en `/admin/private-care`. El panel exige una aprobación explícita antes de marcar una versión como `approved`.
- Solo al canjear correctamente un código de invitación de un solo uso con Clerk (correo principal verificado), el trigger transaccional crea la ficha de paciente y copia el plan preparado. Si fue aprobado previamente, se publica; si no, continúa como borrador no visible.
- El consentimiento del paciente sigue siendo necesario para mostrar cualquier instrucción publicada.
- Si ya canjeó un código y el plan quedó en borrador, el propietario puede revisarlo y publicarlo desde el apartado habitual de planes.
- La revisión debe contemplar vigencia y evolución actual; tratamientos de rescate de muy corto plazo pueden quedar desactualizados rápidamente y **nunca deben publicarse sin confirmar pertinencia clínica**.

## Seguridad y pruebas

- RLS habilitado y sin permisos para `anon` ni `authenticated`.
- Ninguna consulta del paciente recupera planes preparados ni borradores.
- Pruebas SQL transaccionales con rollback verifican que un plan no aprobado se copia como borrador y uno aprobado se copia como publicado, con auditoría.
- Antes de emplearlo en atención clínica se debe validar el recorrido completo desde una cuenta real verificada (invitación, canje, consentimiento y aislamiento entre pacientes).
