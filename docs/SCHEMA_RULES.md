# HAUTLAB Structured Data Rules

## Principles

Structured data must describe visible, truthful content. It must not be used to manufacture authority, ratings, credentials, offers or locations.

## Global graph

Where supported by the implementation, maintain a coherent entity graph connecting:

- `WebSite`
- `Organization`
- `MedicalClinic`
- `Person` / `Physician`
- Location entities
- Official social profiles through `sameAs`

Use stable `@id` values so entities are referenced consistently across pages.

## Page-level types

Use only when the page supports them:

- `WebPage` or `MedicalWebPage`
- `Service`
- `MedicalProcedure`
- `MedicalCondition`
- `Article` or `BlogPosting`
- `FAQPage`
- `BreadcrumbList`
- `ImageObject`
- `VideoObject`

## Required controls

- Schema content must match visible page content.
- One canonical URL per page.
- Breadcrumbs must match actual navigation.
- FAQ schema must mirror visible questions and answers.
- Service provider and location must be correct for that page.
- Dates must use valid ISO formats.
- Do not mark promotional copy as medical fact.

## Forbidden unsupported data

Never invent or infer:

- Aggregate ratings.
- Review counts.
- Awards.
- Board certifications.
- Medical specialties not formally supported.
- Prices or offers.
- Opening hours.
- Addresses.
- Availability.

## Validation

Every schema change must be checked for:

1. Valid JSON-LD syntax.
2. Duplicate entity conflicts.
3. Correct canonical URL.
4. Consistent `@id` references.
5. Agreement with visible page content.
6. No false review or credential claims.

Document validation results in the pull request.