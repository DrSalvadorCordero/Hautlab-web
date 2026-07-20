# HAUTLAB — Auditoría SEO/AEO, Fase 1

**Fecha del corte:** 20 de julio de 2026  
**Sitio:** https://www.hautlabmx.com  
**Repositorio:** `DrSalvadorCordero/Hautlab-web`  
**Rama de trabajo:** `seo-aeo-phase-1-audit`  
**Alcance:** inventario, arquitectura, indexabilidad, contenido, enlazado interno, datos estructurados y brechas.  
**Estado:** documental. No modifica páginas públicas ni producción.

## Resultado ejecutivo

La arquitectura actual ya supera la premisa del audit externo que afirmaba que los servicios estaban concentrados en la página principal. El sitemap público contiene **27 URLs canónicas**: 5 páginas base, 4 hubs temáticos y 18 páginas individuales de procedimientos o condiciones.

La prioridad no es fabricar URLs con el sufijo `-merida`. Eso duplicaría intenciones que ya tienen una página canónica y podría fragmentar autoridad. El mayor retorno está en **profundizar las URLs existentes**, reforzar señales locales, mejorar autoridad médica verificable y ordenar los enlaces internos.

### Diagnóstico resumido

| Área | Estado actual | Prioridad |
|---|---|---:|
| Arquitectura de URLs | Sólida; 18 páginas específicas ya creadas | Mantener |
| Intención local Mérida | Presente en títulos y sitio global, débil dentro del cuerpo de muchas páginas | Alta |
| Profundidad clínica | Correcta como introducción, insuficiente para consultas médicas competitivas | Muy alta |
| Dermatología clínica | El hub usa “Condiciones de piel” y no captura con claridad la intención principal | Crítica |
| Autoría y revisión médica | No existe un bloque reutilizable visible por página | Muy alta |
| Enlazado interno | Funcional, pero cada página suele tener solo 2 relacionados | Alta |
| Schema | Base correcta; falta un gráfico de entidades y `Service` | Alta |
| Imágenes y alt | Mezcla de descripciones útiles y textos genéricos | Media |
| Sitemap | Correcto, pero `lastModified` cambia para todas las URLs en cada build | Media |
| CDMX | No existe hub; debe crearse solo con datos operativos reales | Posterior |

## Inventario confirmado

El inventario detallado de las 27 URLs se encuentra en:

`docs/seo-aeo/phase-1-url-inventory.csv`

### Distribución

- 1 homepage.
- 1 biblioteca de procedimientos.
- 3 páginas operativas o institucionales.
- 4 hubs temáticos.
- 18 páginas individuales de procedimientos o condiciones.

Todas las URLs del sitemap usan `https://www.hautlabmx.com` como host canónico. El dominio sin `www` redirige permanentemente al host principal.

## Hallazgos prioritarios

### P0 — Resolver antes de crear nuevas páginas

#### 1. Reposicionar el hub de dermatología clínica

URL actual:

`/tratamientos/dermatologia-clinica`

Estado:

- Title: `Condiciones de piel | HAUTLAB + Dr. Salvador Cordero`
- H1: `Condiciones de piel`
- La URL es correcta.
- El contenido menciona acné, rosácea, melasma, dermatitis, caída de cabello, uñas y piel sensible.
- La página no expresa con suficiente claridad “dermatología clínica en Mérida” en title, H1 ni cuerpo principal.

Acción propuesta para Fase 2:

- conservar la URL;
- orientar title y H1 a dermatología clínica en Mérida;
- incorporar contexto de consulta, evaluación de piel, cabello y uñas;
- incluir señales locales de San Ramón Norte;
- enlazar a las condiciones específicas;
- evitar crear `/dermatologo-merida` como duplicado sin resolver primero esta intención.

**Decisión requerida:** validar el wording legal y profesional que puede utilizarse de forma pública. El código actual mezcla `Dermatólogo en Mérida` en `mapQuery` con `Médico Cirujano` en datos estructurados.

#### 2. Profundizar siete páginas prioritarias

Orden recomendado:

1. `/tratamientos/dermatologia-clinica`
2. `/procedimientos/rinomodelacion`
3. `/procedimientos/toxina-botulinica`
4. `/procedimientos/acne`
5. `/procedimientos/melasma`
6. `/procedimientos/alopecia`
7. `/procedimientos/cicatrices-acne`

Las páginas individuales ya contienen:

- definición;
- indicaciones;
- situaciones en que no se fuerza;
- enfoque HAUTLAB;
- expectativas generales;
- inversión;
- dos preguntas frecuentes;
- dos enlaces relacionados.

Faltan, según aplique:

- valoración previa diferenciada;
- duración del procedimiento;
- molestias esperables;
- recuperación específica;
- evolución y duración de resultados;
- riesgos y señales de alarma;
- contraindicaciones completas;
- alternativas;
- autor y fecha de revisión;
- referencias clínicas;
- bloque local útil;
- 3 a 6 enlaces internos coherentes.

#### 3. Validar indexación real en Search Console

El sitemap responde correctamente y contiene 27 URLs. Search Console ya procesó las 27, pero una búsqueda pública no sustituye la inspección de URL.

Inspeccionar individualmente:

- homepage;
- dermatología clínica;
- rinomodelación;
- toxina botulínica;
- acné;
- cicatrices de acné;
- contacto.

Registrar para cada una:

- indexada o no;
- canonical declarada y seleccionada;
- última exploración;
- estado de renderizado;
- mejora o error detectado.

### P1 — Autoridad, contenido y arquitectura semántica

#### 4. Crear bloques reutilizables de autoridad médica

Agregar a las páginas clínicas y de procedimientos:

- autor;
- credenciales verificables;
- fecha de publicación;
- fecha de última revisión;
- revisor médico cuando aplique;
- fuentes;
- aviso de información orientativa y resultados individuales.

No se deben inventar asociaciones, especialidades, certificaciones ni cargos.

#### 5. Mejorar el enlazado interno

Actualmente la mayoría de páginas tiene:

- breadcrumbs;
- enlace al hub;
- dos páginas relacionadas.

Objetivo:

- 3 a 6 enlaces relevantes por página;
- anclas naturales;
- enlaces colocados dentro del contexto clínico, no solo en sidebar;
- evitar repetir el mismo par de enlaces en todo el sitio.

Correcciones especialmente necesarias:

- Alopecia: reemplazar enlaces débiles a acné y rosácea por cuero cabelludo, dermatitis seborreica, consulta dermatológica o estudios, cuando existan.
- Cicatrices de acné: priorizar acné, microneedling, radiofrecuencia fraccionada y peelings; melasma no debe ser el enlace principal.
- Verrugas: relacionar con evaluación de lesiones, procedimientos focales y cuidados; “Todas las áreas” aporta poca autoridad temática.
- Rinomodelación: sumar mentón, mandíbula y armonización facial.
- Acné: conectar cicatrices, peelings, rosácea y plan dermatológico.

#### 6. Evolucionar los datos estructurados

Estado actual:

- `MedicalClinic` global.
- `MedicalWebPage`, `FAQPage` y `BreadcrumbList` en páginas dinámicas.
- `FAQPage` coincide con preguntas visibles.

Mejora propuesta:

- usar identificadores `@id`;
- relacionar `MedicalClinic`, `Person`/`Physician`, `Organization` y `WebSite`;
- añadir `Service` cuando el contenido visible describa un servicio real;
- añadir `WebPage` o `MedicalWebPage` con autoría y fechas;
- añadir breadcrumbs a hubs y biblioteca;
- no implementar `Review` para testimonios controlados por la propia clínica buscando estrellas;
- no declarar servicios o credenciales no verificadas.

#### 7. Corregir fechas del sitemap

`app/sitemap.ts` utiliza `new Date()` para todas las URLs. Cada despliegue aparenta actualizar todo el sitio.

Propuesta:

- guardar fechas de revisión por contenido;
- usar la fecha real de modificación;
- evitar enviar señales de actualización artificiales;
- mantener fuera del sitemap las páginas `noindex`, API y área administrativa.

### P2 — Mejoras posteriores

#### 8. Contexto local Mérida

Incorporar en las páginas prioritarias, sin keyword stuffing:

- Mérida, Yucatán;
- San Ramón Norte;
- atención con cita;
- dirección;
- modalidad de valoración;
- precio autorizado;
- WhatsApp;
- indicaciones de acceso cuando aporten valor.

No crear versiones duplicadas como `/rinomodelacion-merida` mientras exista `/procedimientos/rinomodelacion`.

#### 9. Hub CDMX

Crear `/cdmx` únicamente cuando se confirmen:

- sede o sedes vigentes;
- periodicidad real;
- procedimientos disponibles;
- precios autorizados;
- agenda;
- fotografías;
- instrucciones de acceso.

No copiar la página de Mérida cambiando la ciudad. Las páginas `/cdmx/rinomodelacion` o `/cdmx/toxina-botulinica` deben esperar a que exista demanda y contenido operativo distinto.

#### 10. Imágenes

Hallazgos:

- existen alt text específicos en varias páginas;
- otras heredan `Visual editorial HAUTLAB`;
- algunas imágenes editoriales se reutilizan para múltiples intenciones.

Acciones:

- describir lo que la imagen muestra;
- no insertar ciudad, doctor y procedimiento de forma mecánica;
- sustituir alts genéricos;
- incorporar fotografías auténticas cuando estén autorizadas;
- revisar tamaños y carga sin alterar el sistema actual de `next/image`.

## Brechas de contenido

### Temas ya mencionados en la navegación o hubs, sin página propia

| Tema | Página actual que lo menciona | Recomendación |
|---|---|---|
| Dermatitis | Dermatología clínica | Crear después de definir alcance |
| Vitíligo | Dermatología clínica y navegación | Alta oportunidad clínica |
| Uñas / onicomicosis | Dermatología clínica | Separar cuando el servicio esté confirmado |
| Estrías | Piel y textura | Crear página de tratamiento real |
| Quistes | Procedimientos focales | Crear si se atienden de forma regular |
| Dermatoscopia | Procedimientos focales y lunares | Evaluar página propia |
| Cauterización | Procedimientos focales | Mejor como técnica, no como página comercial genérica |
| Biopsias | Procedimientos focales | Crear con indicaciones y proceso |

### Temas que requieren validación operativa antes de redactar

- psoriasis;
- detección de cáncer de piel;
- dermatología pediátrica;
- hiperhidrosis;
- microneedling;
- radiofrecuencia fraccionada;
- retiro de lunares;
- retiro de verrugas;
- otros procedimientos o tecnologías no confirmados en la arquitectura actual.

## Rutas fuera del sitemap

| Ruta | Comportamiento | Observación |
|---|---|---|
| `/rinomodelacion` | Redirección permanente a `/procedimientos/rinomodelacion` | Correcta |
| `/botox` | Redirección permanente a `/procedimientos/toxina-botulinica` | Correcta |
| `/tratamientos/botox` | Redirección permanente | Correcta |
| `/dermatologia-clinica` | Redirección permanente al hub | Correcta |
| `/tratamientos/cicatrices` | Redirección permanente | Correcta |
| `/tratamientos/peelings` | Redirección permanente | Correcta |
| `/tratamientos/menton-mandibula` | Redirección permanente al hub facial | Revisar si existe un destino más específico |
| `/tratamientos/{slug-de-procedimiento}` | Redirección de aplicación a `/procedimientos/{slug}` | Evaluar convertirla en permanente |
| `/gracias` | `noindex, nofollow` | Correcta |
| `/api/*` y `/admin/*` | Bloqueadas en robots | Correcta |

## Riesgos detectados

1. **Canibalización futura:** crear URLs `*-merida` duplicaría páginas que ya tienen títulos locales.
2. **Wording profesional:** ampliar “dermatólogo” sin validar la forma legal y documental puede generar riesgo de marca y cumplimiento.
3. **Contenido médico superficial:** escalar páginas o artículos sin revisión médica reduciría calidad YMYL.
4. **Actualización artificial:** todas las fechas del sitemap cambian en cada build.
5. **Enlaces poco coherentes:** algunos relacionados no refuerzan el clúster clínico.
6. **Schema excesivo:** agregar tipos sin contenido visible o credenciales verificadas puede generar inconsistencias.
7. **CDMX genérico:** una copia geográfica sin operación distinta sería una página de entrada débil.

## Matriz de ejecución recomendada

| Bloque | Alcance | Resultado esperado |
|---|---|---|
| Fase 2A | Hub dermatología + validación de wording | Capturar intención clínica local principal |
| Fase 2B | Rinomodelación y toxina | Mejorar intención comercial con seguridad y profundidad |
| Fase 2C | Acné, melasma, alopecia y cicatrices | Construir autoridad clínica |
| Fase 3 | Enlazado interno y autoridad médica | Mejorar clústeres, confianza y rastreo |
| Fase 4 | Schema y sitemap | Estructura semántica consistente |
| Fase 5 | Hub CDMX | Separar geografía real |
| Fase 6 | Nuevas páginas validadas | Ampliar cobertura sin páginas de entrada |
| Fase 7 | Editorial médica | Long-tail y educación con revisión |

## Decisiones que requieren aprobación

1. Wording exacto de credenciales y especialidad para title, H1 y schema.
2. Datos operativos vigentes de CDMX.
3. Lista final de servicios que realmente se ofrecen.
4. Precios que pueden mostrarse públicamente.
5. Fotografías y casos con autorización.
6. Nombre visible del autor y revisor médico.
7. Referencias y política editorial.

## Método

La auditoría se construyó con:

- sitemap XML público;
- configuración de robots;
- rutas y redirecciones;
- metadata y canonicals;
- catálogo de contenidos;
- componentes de páginas;
- JSON-LD actual;
- enlazado interno;
- revisión puntual de páginas renderizadas;
- estado previamente confirmado de Search Console.

## Cierre de Fase 1

No se recomienda crear páginas nuevas antes de resolver los puntos P0. La siguiente entrega debe limitarse a las siete URLs prioritarias, en un Pull Request separado, con Preview, pruebas y aprobación clínica antes de producción.
