# HAUTLAB Telegram Command Center

Private operator interface for HAUTLAB. Telegram is an operational control surface, not the clinical record.

## Architecture

Telegram Bot API -> `/api/telegram/webhook` -> HAUTLAB command engine -> existing Supabase / WhatsApp / Nimbo data.

The MCP endpoint is `/api/mcp/telegram`. Scheduled delivery is processed by `/api/telegram/cron`.

## Required production secrets

All variables below are server-only and must never use the `NEXT_PUBLIC_` prefix.

- `TELEGRAM_BOT_TOKEN`: token issued by @BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: long random secret sent by Telegram in the webhook secret-token header.
- `TELEGRAM_PAIRING_SECRET`: fallback private pairing secret.
- `TELEGRAM_PAIRING_SECRET_DOCTOR`: optional operator-specific pairing secret.
- `TELEGRAM_PAIRING_SECRET_KAREN`: optional operator-specific pairing secret.
- `TELEGRAM_SETUP_KEY`: protects webhook activation/status.
- `TELEGRAM_MCP_KEY`: protects the MCP endpoint.
- `CRON_SECRET`: protects the Vercel Cron endpoint.

Existing server-only Supabase and WhatsApp variables are also required.

## Activation

1. Create a private bot with @BotFather and copy the token into `TELEGRAM_BOT_TOKEN`.
2. Add the server-only secrets to the production Vercel project.
3. Deploy production.
4. Call `POST /api/telegram/setup` with `Authorization: Bearer <TELEGRAM_SETUP_KEY>`.
   The route registers the bot commands and configures the HTTPS webhook at `/api/telegram/webhook`.
5. In a private Telegram chat with the bot, pair an operator:
   - `/pair doctor <secret>`
   - `/pair karen <secret>`

An already paired operator cannot be silently reassigned to another Telegram user.

## Operator commands

- `/hoy` — operational daily summary.
- `/pendientes` — priority follow-ups.
- `/paciente <nombre>` — patient lookup with minimum necessary operational data.
- `/agenda` — confirmed appointments for today.
- `/tomar <ref>` — human takeover and bot pause.
- `/reanudar <ref>` — return the conversation to automation.
- `/cerrar <ref>` — close conversation.
- `/responder <ref> <mensaje>` — send the exact approved text via WhatsApp and pause automation.
- `/programar mañana 09:00 | texto` — one-time Telegram reminder.
- `/programar YYYY-MM-DD HH:MM | texto` — one-time reminder at a fixed local time.
- `/programar en 30m | texto` — relative reminder.
- `/digest 08:00` — recurring daily operational digest.
- `/digest off` — stop the daily digest.
- `/jobs` — active scheduled jobs.
- `/cancelar <uuid>` — cancel a job.
- `/estado` — integration health.
- `/ayuda` — command list.

## MCP

The endpoint uses Streamable HTTP-style JSON-RPC compatible with the existing HAUTLAB MCP pattern.

Authenticate with `x-hautlab-mcp-key: <TELEGRAM_MCP_KEY>` or the `key` query parameter.

Read tools include connection status, today's summary, pending work, patient search and job listing. Write tools include private operator messaging, scheduling, job cancellation, WhatsApp takeover/resume/close and exact WhatsApp replies.

Every write tool requires `confirmation: "APPROVED"`.

## Security and clinical-data boundary

- Webhook requests require Telegram's secret-token header.
- Only private Telegram chats are processed.
- Only explicitly paired Telegram user IDs can operate the bot.
- Pairing uses long server-side secrets and an operator cannot be replaced silently.
- Supabase service credentials remain backend-only.
- Telegram tables have RLS enabled, no public policies, and no anon/authenticated privileges.
- Webhook updates are deduplicated and audited.
- Audit records do not store the raw message body.
- Patient outputs intentionally omit phone numbers, date of birth, clinical notes and detailed diagnoses.
- Nimbo remains the clinical/scheduling system of record; Telegram is an operator surface.
