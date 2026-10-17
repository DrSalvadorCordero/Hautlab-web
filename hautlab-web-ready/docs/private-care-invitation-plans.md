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

## Separación de información médica interna y visible

- `private_care_prepared_plans.internal_notes` almacena exclusivamente el razonamiento, el contexto diagnóstico, los textos `borrador` y los pendientes del médico. El campo no existe en `private_care_plans`, que es la tabla utilizada por el portal del paciente.
- `summary`, `title` y `phases` son campos *potencialmente visibles* cuando el plan sea aprobado y la invitación canjeada. Nunca deben incluir anotaciones internas.
- En el panel del propietario, las notas internas se muestran en una sección separada y expandible. El médico visualiza también el estado borrador/ aprobado y confirma personalmente su vigencia.
- Los controles del servidor bloquean intentos de aprobar/publicar planes que contengan marcadores explícitos de trabajo interno como `borrador` o `pendiente de revisión médica` en los campos visibles.
- La protección de datos sensibles se prueba en Supabase con transacciones revertidas: canjear una invitación con un plan aprobado copia únicamente las instrucciones aprobadas, sin las notas internas.
- La aceptación del consentimiento sigue siendo necesaria para leer cualquier plan publicado.
