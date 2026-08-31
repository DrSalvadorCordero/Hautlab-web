# HAUTLAB Staff iOS

Aplicación interna para HAUTLAB.

## Funciones incluidas
- Inicio de sesión con Supabase Auth.
- Activación por código de alta de un solo uso.
- Check-in/check-out validado por geocerca.
- Monitoreo de entrada/salida de geocerca únicamente durante turno activo, sin registrar una ruta continua.
- Registro de efectivo con atribución Karen / Dr. Salvador / orgánico / referido.
- Comisión calculada en servidor (2% estándar, 1% reactivación, 0% no comisionable).
- Panel mensual de sueldo base + comisión + bono + score.
- Calibración de sede disponible sólo para manager.

## Compilar
1. En macOS instala Xcode 16.4+ y XcodeGen.
2. Desde esta carpeta ejecuta `xcodegen generate`.
3. Abre `HAUTLABStaff.xcodeproj`.
4. Selecciona tu Apple Development Team y un dispositivo/simulador.
5. Compila con Cmd+R.

## Primer acceso
- Crear/iniciar sesión con correo y contraseña.
- Introducir el código de alta asignado al rol.
- El manager calibra una sola vez la sede estando físicamente en HAUTLAB.
- Karen concede ubicación. Al iniciar turno la app solicita permiso adecuado para geocerca.

## Privacidad
La geocerca se usa para validar presencia laboral. El monitoreo se detiene al hacer check-out. No se implementa grabación de ruta GPS 24/7 ni modo de ubicación continua en segundo plano.
