# Check-in / Check-out HAUTLAB

El módulo vive únicamente en `/admin/asistencia` y usa Clerk para identidad. No recopila GPS, fotografías ni biometría.

## Activación

1. Instalar o vincular Clerk desde Vercel Marketplace al proyecto `hautlabmx.com`. La integración agrega las claves de Clerk al proyecto.
2. Crear o conectar un proyecto Supabase privado desde Vercel Marketplace. La integración sincroniza sus variables automáticamente.
3. Ejecutar `docs/attendance.sql` una sola vez en el SQL Editor de Supabase.
4. Verificar que Vercel tenga:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (preferida por la integración nativa) o `SUPABASE_SERVICE_ROLE_KEY` (nombre legado compatible)
   - `HAUTLAB_OWNER_EMAILS` es opcional; si falta, se usa `dr.salvadorcordero@gmail.com`.
5. Crear la organización HAUTLAB, invitar a Karen Raquel Cruz Pacheco como `org:member` y conservar al propietario como `org:admin` o correo propietario.
6. Volver a desplegar producción después de conectar o modificar integraciones y variables.

## Reglas aplicadas

- Hora almacenada en UTC y presentada en `America/Merida`.
- Una sola jornada abierta por persona.
- Entrada y salida originales inmutables.
- Karen solo consulta y marca sus propias jornadas.
- Propietario/administrador consulta al equipo, configura horario/tolerancia, corrige y exporta CSV.
- Toda corrección exige motivo y conserva antes/después, autor y fecha.
- Los registros se revierten lógicamente; no se eliminan.
- Tablas con RLS habilitado y sin políticas para clientes. Solo la API del servidor usa una clave secreta de Supabase.
