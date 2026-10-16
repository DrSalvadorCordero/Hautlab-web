# HAUTLAB Cabina Dermatocosmética — administración de contenido

El panel protegido permite modificar contenido sin editar componentes de la página.

## Módulos

- `/admin/cabina`: portada, perfil de Karen, servicios, precios, duraciones, visibilidad, horarios y preguntas frecuentes.
- `/admin/cabina/medios`: fotografías, mensajes de reservación, promociones y reseñas verificadas.

## Publicación

Los cambios se almacenan como archivos JSON versionados en GitHub. Esto mantiene historial, revisión y despliegues reversibles en Vercel.

Variables privadas requeridas en Vercel:

```text
HAUTLAB_CONTENT_GITHUB_TOKEN
HAUTLAB_CONTENT_REPOSITORY=DrSalvadorCordero/Hautlab-web
HAUTLAB_CONTENT_BRANCH=content/cabina-publishing
```

`HAUTLAB_CONTENT_GITHUB_TOKEN` debe ser un token fine-grained limitado exclusivamente al repositorio y con permisos mínimos para Contents. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni compartirse por chat.

`HAUTLAB_CONTENT_BRANCH` debe señalar una rama dedicada no protegida para preparar cambios. Las rutas de publicación rechazan `main`, `master`, valores vacíos y referencias equivalentes. Producción no publica directamente a `main`: el contenido pasa por PR, CI y revisión antes de integrarse. La rama configurada debe existir antes de usar el editor.

## Imágenes

Formatos admitidos:

- WebP
- AVIF
- JPG
- PNG

Tamaño máximo: 5 MB por archivo. Las fotografías de pacientes requieren autorización documentada antes de publicarse.

## Reseñas

No se publica ninguna reseña de forma automática. Cada opinión debe ser específica de la cabina, verificable y activarse manualmente. No se reutilizan reseñas generales de HAUTLAB como si fueran de Karen o de la cabina.
