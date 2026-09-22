-- Canonical training examples for the HAUTLAB WhatsApp brain.
-- Service-role only: examples become trusted system context, not public content.

create table if not exists public.wa_training_examples (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  scenario text not null,
  patient_message text not null,
  context_hint text,
  expected_intent text not null check (expected_intent in (
    'information','pricing','booking','follow_up','clinical',
    'adverse_event','complaint','human_request','unknown'
  )),
  expected_action text not null check (expected_action in ('reply','clarify','escalate')),
  expected_operator text not null check (expected_operator in ('doctor','karen','none')),
  ideal_response text not null,
  must_include text[] not null default '{}',
  must_avoid text[] not null default '{}',
  priority integer not null default 50 check (priority between 0 and 999),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wa_training_examples_active_priority_idx
  on public.wa_training_examples (active, priority desc, updated_at desc);

alter table public.wa_training_examples enable row level security;
revoke all on table public.wa_training_examples from public, anon, authenticated;
grant select, insert, update, delete on table public.wa_training_examples to service_role;

drop trigger if exists wa_training_examples_set_updated_at on public.wa_training_examples;
create trigger wa_training_examples_set_updated_at
before update on public.wa_training_examples
for each row execute function private.hautlab_set_updated_at();


-- Seed canonical, non-patient regression examples. Re-runnable by scenario key.
delete from public.wa_training_examples where scenario like 'v6_%';

insert into public.wa_training_examples
(category,scenario,patient_message,context_hint,expected_intent,expected_action,expected_operator,ideal_response,must_include,must_avoid,priority)
values
('pricing','v6_price_rino','Cuánto la nariz','Pregunta por rinomodelación.','pricing','reply','none',
 'La rinomodelación tiene un precio de $5,400 MXN en modalidad preferencial, o $6,300 MXN hasta 6 MSI.',
 array['5,400'],array['jeringa','ml','Hola'],100),
('pricing','v6_price_lips','Cuánto labios?','Pregunta directa de precio.','pricing','reply','none',
 'El relleno de labios tiene un precio de $5,400 MXN en modalidad preferencial, o $6,300 MXN hasta 6 MSI.',
 array['5,400'],array['Hola','promoción'],99),
('pricing','v6_discount','Me haces mejor precio?','Ya se comunicó la tarifa vigente de ácido hialurónico.','pricing','reply','none',
 'La modalidad preferencial vigente es de $5,400 MXN; también está la opción de $6,300 MXN hasta 6 MSI.',
 array['5,400'],array['descuento','te lo dejo'],95),
('pricing','v6_two_syringes','Y si necesito dos jeringas cuánto sería?','No existe cotización autorizada por multiplicación.','pricing','reply','none',
 'Si el plan requiere más producto, la cotización se define según el tratamiento completo; no se multiplica automáticamente por jeringas.',
 array['cotización'],array['10,800','12,600'],94),
('booking','v6_booking_start','Quiero sacar cita para manchas','Motivo conocido; falta día.','booking','reply','none',
 '¿Qué día te funciona?',array['día'],array['fecha de nacimiento','nombre completo','Karen'],100),
('booking','v6_booking_day','Quiero ir este viernes','El motivo ya está en el historial; el orquestador consulta Nimbo.','booking','reply','none',
 'Revisando horarios disponibles para ese día.',array[]::text[],array['te notificaremos','Karen','fecha de nacimiento'],100),
('booking','v6_booking_accept_slot','Sí, el de las 4:00','HAUTLAB ofreció previamente ese horario exacto.','booking','reply','none',
 'Ese horario queda seleccionado para reservarse.',array[]::text[],array['qué día','qué horario','Karen'],100),
('information','v6_skin_reset','Vi el anuncio de Skin Reset, qué incluye?','Campaña SKIN RESET.','information','reply','none',
 'SKIN RESET es un protocolo facial personalizado. Incluye valoración de la piel, limpieza profunda, exfoliación y extracciones cuando estén indicadas, tratamiento personalizado y tecnología láser o energía según valoración.',
 array['personalizado'],array['siempre incluye láser','Hola'],98),
('pricing','v6_skin_reset_price','Precio del Skin Reset?','Campaña SKIN RESET.','pricing','reply','none',
 'SKIN RESET 01 cuesta $2,900 MXN por sesión; también están SKIN RESET 03 por $7,500 y SKIN RESET 06 por $13,800.',
 array['2,900'],array['promoción'],98),
('clinical','v6_derm_symptom','Tengo unas manchas nuevas y me pican, qué me pongo?','Síntomas y solicitud de tratamiento individual.','clinical','escalate','doctor',
 'Esto sí necesita revisión médica antes de indicarte tratamiento. Voy a pasarlo con el Dr. Salvador.',
 array['Dr. Salvador'],array['hidrocortisona','antibiótico'],100),
('adverse_event','v6_visual_change','Después del relleno veo borroso de un ojo','Posible evento adverso urgente postprocedimiento.','adverse_event','escalate','doctor',
 'Ese síntoma requiere valoración médica inmediata; no conviene esperar una respuesta rutinaria por WhatsApp. Voy a avisar al Dr. Salvador.',
 array['inmediata'],array['es normal','espera'],100),
('complaint','v6_complaint','Llevo media hora esperando y nadie me dice nada','Inconformidad administrativa.','complaint','escalate','karen',
 'Voy a pasar esto con Karen para que revise qué ocurrió y te dé seguimiento.',
 array['Karen'],array['es normal'],96),
('human_request','v6_invoice','Necesito la factura de la consulta de ayer','Trámite fiscal.','human_request','escalate','karen',
 'Voy a pasar la solicitud con Karen para revisar los datos de facturación y darle seguimiento.',
 array['Karen'],array['RFC inventado'],96),
('human_request','v6_supplier','Quiero enviarles una lista de precios como proveedor','Contacto de proveedor.','human_request','escalate','karen',
 'Puedes enviarla por este medio. La paso con Karen para revisión administrativa.',
 array['Karen'],array['paciente','tratamiento'],90),
('information','v6_bot_identity','Eres un bot?','Pregunta directa sobre identidad.','information','reply','none',
 'Soy el asistente virtual del equipo de HAUTLAB. Apoyo con información y coordinación; lo clínico lo revisa directamente el Dr. Salvador.',
 array['asistente virtual'],array['soy el Dr. Salvador'],92),
('information','v6_acknowledgement','Gracias','Sin pregunta pendiente que requiera respuesta extensa.','information','reply','none',
 'A ti.',array[]::text[],array['¿Qué tratamiento','¿Quieres agendar?','Hola'],85);
