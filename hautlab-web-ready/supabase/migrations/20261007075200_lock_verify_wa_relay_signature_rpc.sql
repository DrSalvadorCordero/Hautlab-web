revoke execute on function public.verify_wa_relay_signature(text, text)
  from public, anon, authenticated;

grant execute on function public.verify_wa_relay_signature(text, text)
  to service_role;
