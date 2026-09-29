-- HAUTLAB WhatsApp: current operations are Mérida-only and prices should be
-- communicated directly when an authorized amount exists.

update public.wa_knowledge_base
set city = 'all',
    priority = 120,
    content = 'La atención actual de HAUTLAB es únicamente en Mérida, Yucatán. Dirección confirmada: Calle 43 299A x 32A, San Ramón Norte, C.P. 97128, Mérida, Yucatán. Número de WhatsApp operativo: +52 999 280 9758. En conversación con pacientes asume Mérida como única sede operativa, no preguntes ciudad, no ofrezcas CDMX ni otra sede y no menciones otra ciudad salvo para aclarar que actualmente la atención es únicamente en Mérida.',
    updated_at = now()
where title = 'Sede Mérida';

insert into public.wa_knowledge_base
  (knowledge_key, category, city, title, content, priority, active, source_note, updated_at)
values
  (
    'commercial.direct_price_merida_only.v1',
    'commercial',
    'all',
    'Precio directo y sede única Mérida',
    'Cuando el paciente pregunte precio, costo, cuánto cuesta o responda únicamente “precio”, responde de inmediato con la tarifa autorizada disponible en el catálogo o en este contexto; no preguntes si quiere que le compartas la tarifa y no obligues a pasar primero por valoración para conocer un precio ya autorizado. Presenta la opción más atractiva autorizada primero y, si existe, después la alternativa con meses sin intereses. Para SKIN RESET, si el hilo ya identifica la campaña o el tratamiento, comunica directamente: SKIN RESET 01 $2,900 MXN por sesión; SKIN RESET 03 $7,500 MXN; SKIN RESET 06 $13,800 MXN. Si el servicio solo tiene precio “desde” autorizado, usa “desde”. Solo escala o pide confirmación cuando realmente no exista ninguna cifra autorizada. Toda comunicación de sede y precios corresponde únicamente a Mérida mientras esta regla esté activa.',
    119,
    true,
    'Ajuste operativo solicitado por Dr. Salvador el 2026-09-29: precios menos restrictivos, directos y solo Mérida.',
    now()
  )
on conflict (knowledge_key) do update
set category = excluded.category,
    city = excluded.city,
    title = excluded.title,
    content = excluded.content,
    priority = excluded.priority,
    active = excluded.active,
    source_note = excluded.source_note,
    updated_at = excluded.updated_at;

update public.wa_service_catalog
set notes = replace(notes, '$5,400 MXN', '$5,500 MXN'),
    updated_at = now()
where active = true
  and notes like '%$5,400 MXN%';

update public.wa_training_examples
set ideal_response = replace(ideal_response, '$5,400 MXN', '$5,500 MXN'),
    updated_at = now()
where active = true
  and ideal_response like '%$5,400 MXN%';
