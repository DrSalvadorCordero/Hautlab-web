# Auditoría SEO/AEO — Rosácea (14 octubre 2026)

URL auditada: https://www.hautlabmx.com/procedimientos/rosacea

## Hallazgo verificable
La landing ya responde qué es rosácea, valoración, riesgos, signos de alarma y preguntas frecuentes. La sección «Relacionados» visible enlaza Acné y Melasma, pero no lleva a dos recursos educativos relevantes ya registrados en Journal:
- /journal/acne-vs-rosacea-como-distinguir
- /journal/rosacea-barrera-cutanea-irritar-no-es-tratar

## Propuesta mínima de actualización
En `hautlab-web-ready/data/treatments-v2.ts`, dentro de la entrada `rosacea`, ampliar únicamente `related` con dos objetos:
```ts
{ label: "Journal · Acné vs rosácea", href: "/journal/acne-vs-rosacea-como-distinguir" },
{ label: "Journal · Rosácea y barrera cutánea", href: "/journal/rosacea-barrera-cutanea-irritar-no-es-tratar" },
```

Conservar los enlaces existentes a Acné y Melasma. No modificar textos clínicos, metadatos, precios, credenciales ni schema.

## Intención y canibalización
Landing transaccional local: «tratamiento rosácea Mérida». Journal comparativo: «acné vs rosácea». Journal de barrera: «rosácea y barrera cutánea». Los destinos son complementarios y ya existen en main; enlazarlos ayuda al descubrimiento sin crear contenido duplicado.

## Validación
Se verificó la URL pública, su sección «Relacionados» y la existencia de ambos destinos en el repositorio. La modificación directa del archivo fue bloqueada dos veces por los controles de escritura del conector; por tanto este PR solo registra una propuesta auditada, no la implementación.

## Riesgos y revisión
Cambio propuesto de bajo riesgo, sin nuevos consejos médicos. Revisar navegación móvil y existencia de los enlaces tras aplicar la actualización. La revisión médica de los artículos destino debe mantenerse según sus propios controles editoriales.

## Estado
**Bloqueado parcialmente**. Reintentar modificación segura de `treatments-v2.ts` en siguiente ejecución, luego build/lint y PR de implementación. No fusionar este PR de auditoría como si ya hubiera actualizado la landing.
