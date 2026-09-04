# HAUTLAB · Billing activation runbook

## Authority model

- Mercado Pago / Point: payment authority and payment status.
- HAUTLAB: reconciliation, queue, fiscal-data collection and audit trail.
- Facturama API Web: CFDI 4.0 issuance/cancellation/document authority.
- SAT: fiscal authority.

## Issuer fixed data

- Name: SALVADOR CORDERO ROMERO
- RFC: CORS921130FAA
- Fiscal regime: 612
- Expedition ZIP: 97128

Do not put the CSD private key, password, Mercado Pago access tokens or Facturama credentials in GitHub.

## Mercado Pago applications

- Checkout: `5395737521382943` (`Mcp Cordero`)
- Point: `8283735828387207` (`HAUTLAB Point`)

Configured webhooks:

- Checkout: `https://www.hautlabmx.com/api/payments/mercado-pago/webhook`
  - `payment`
  - `topic_chargebacks_wh`
- Point: `https://www.hautlabmx.com/api/payments/mercado-pago-point/webhook`
  - `order`
  - `topic_chargebacks_wh`

## Required Vault secrets

Checkout:

- `hautlab_mp_access_token_test`
- `hautlab_mp_webhook_secret_test`
- `hautlab_mp_access_token_production`
- `hautlab_mp_webhook_secret_production`

Point:

- `hautlab_mp_point_access_token_test`
- `hautlab_mp_point_webhook_secret_test`
- `hautlab_mp_point_access_token_production`
- `hautlab_mp_point_webhook_secret_production`

Facturama:

- `hautlab_facturama_username_test`
- `hautlab_facturama_password_test`
- `hautlab_facturama_username_production`
- `hautlab_facturama_password_production`

## Activation sequence

1. Apply Supabase migration `20260904043000_create_facturama_billing.sql`.
2. Store sandbox credentials in Vault.
3. Keep `billing_provider_config.active_mode='test'` and `enabled=false` while validating account/profile.
4. Confirm Facturama API Web fiscal profile contains the issuer and current CSD.
5. Set `enabled=true` in test only after the account check succeeds.
6. Generate a recent Mercado Pago Checkout test payment and a Point Orders test order.
7. Simulate/verify Point states: processed, failed/rejected, cancelled, refunded and action_required.
8. Verify each successful payment creates exactly one `billing_invoice_requests` row.
9. Capture exact CFDI 4.0 receiver fields: RFC, legal name, fiscal regime, fiscal ZIP and CFDI use.
10. Issue a sandbox CFDI for the known consultation service and download both XML and PDF.
11. Run Mercado Pago quality evaluation with the new payment/order IDs (must be <=7 days old).
12. Activate Mercado Pago production credentials in each Developer application.
13. Copy the two production webhook signature secrets into Supabase Vault.
14. Select the physical Point terminal, switch it to PDV mode, persist `terminal_id`, then set Point `enabled=true`.
15. Activate Facturama API production subscription/profile, store production username/password in Vault, verify CSD, then switch billing to `production` and `enabled=true`.
16. Perform one low-value controlled real payment and verify payment -> webhook -> reconciliation -> invoice queue. Do not auto-timbrar without receiver fiscal data.

## Fiscal guardrail

Only `medical_assessment` is preloaded because its SAT mapping/tax treatment is evidenced by prior HAUTLAB invoices:

- Product/service: 85121611
- Unit: E48
- Tax object: 02
- Tax: IVA Exento, rate 0

Do not copy that tax profile blindly to aesthetic procedures. Every additional service must be reviewed and inserted into `billing_service_catalog` with its own SAT product/service code and tax treatment.
