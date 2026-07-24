# Check-in / Check-out HAUTLAB

El módulo vive únicamente en `/admin/asistencia` y usa Clerk para identidad. No recopila GPS, fotografías ni biometría.

## Activación

1. Crear o conectar un proyecto Supabase privado al proyecto `hautlabmx.com` en Vercel.
2. Ejecutar `docs/attendance.sql` una sola vez en el SQL Editor de Supabase.
3. Agregar en Vercel, para Production y Preview:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; nunca usar prefijo `NEXT_PUBLIC_`)
4. Configurar Clerk:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `HAUTLAB_OWNER_EMAILS`
5. Crear la organización HAUTLAB, invitar a Karen Raquel Cruz Pacheco como `org:member` y conservar al propietario como `org:admin` o correo propietario.

## Reglas aplicadas

- Hora almacenada en UTC y presentada en `America/Merida`.
- Una sola jornada abierta por persona.
- Entrada y salida originales inmutables.
- Karen solo consulta y marca sus propias jornadas.
- Propietario/administrador consulta al equipo, configura horario/tolerancia, corrige y exporta CSV.
- Toda corrección exige motivo y conserva antes/después, autor y fecha.
- Los registros se revierten lógicamente; no se eliminan.
- Tablas con RLS habilitado y sin políticas para clientes. Solo la API del servidor usa la service role.
