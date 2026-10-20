# HAUTLAB Care Plan — pilot scope

## Status

Interactive **demo only**. Route: `/experiencia/mi-plan`. Linked from `/experiencia`.

This route is not a clinical portal, prescription, authenticated patient account, or Nimbo synchronization. It does not identify Adrián Loya or any other patient.

## Implemented

- Accessible native buttons for 4 panels: inflammation, antifungal therapy, daily care, urgent signs.
- Information presented in order, designed for mobile and desktop.
- Session-only "read" markers, not adherence tracking and not persisted locally or remotely.
- Generic WhatsApp follow-up CTA that contains no automatically filled patient information.
- No patient name, clinical photograph, chart number, diagnostic record, or individual prescription in the repository or URL.
- noindex/nofollow metadata and no-referrer on the demo route.

## Security / clinical boundary

- Public demo data is strictly educational. The route must **never** accept or render individual medical data by query string, static JSON, client-side localStorage, or unprotected API.
- Clinical treatment plans require authenticated patient identity, authorization per record, secure data source, clinician approval/versioning, an audit trail, and explicit consent/privacy review before any real patient data is shown.
- Never treat a read marker as completion of a treatment or a transition to a new treatment phase.
- The clinician remains responsible for individual prescriptions, diagnosis, and follow-up. This mockup cannot prescribe.

## Acceptance criteria before pilot is ready

1. `npm ci`, `npm run lint`, `npm run type-check` and `npm run build` pass in `hautlab-web-ready`.
2. On an iPhone-size viewport, all four buttons are operable, each shows the correct content, and the read markers can be toggled/reset.
3. Links open correct destinations; no mobile horizontal clipping, broken focus states, or inaccessible buttons.
4. No individual patient data appears in HTML, source files, metadata, analytics event labels, or server logs.
5. Draft PR reviewed before merge. Preview deployment checked before calling production "verified".

## Next phase (separate, not implicitly authorized by demo)

Patient account / invite authentication, row-level access control, Nimbo data mapping, clinician-approved treatment plan records, patient-specific timeline, revision history, and clinician escalation workflows.
