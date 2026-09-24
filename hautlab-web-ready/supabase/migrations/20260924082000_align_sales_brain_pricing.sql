-- HAUTLAB Sales Brain v1 commercial alignment.
-- Idempotent correction after the 2026-09-22 WhatsApp training seed.

update public.wa_service_catalog
set cash_price_mxn = 5500
where service_key in (
  'hyaluronic_acid_one_syringe',
  'lip_filler',
  'tear_trough_filler',
  'rhinomodeling'
);

update public.wa_service_catalog
set price_mxn = 6300,
    cash_price_mxn = 5500
where service_key in (
  'chin_jawline_filler',
  'midface_cheek_filler'
);

update public.wa_training_examples
set ideal_response = replace(ideal_response, '$5,400', '$5,500'),
    must_include = array_replace(must_include, '5,400', '5,500')
where scenario in (
  'v6_price_rino',
  'v6_price_lips',
  'v6_discount'
);
