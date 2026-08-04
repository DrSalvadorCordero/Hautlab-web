# HAUTLAB Automation Operating Rules

## Weekly automation

The weekly SEO/AEO automation must:

1. Read all files in `/docs` before analysis.
2. Audit the public site and repository.
3. Identify no more than five highest-impact opportunities.
4. Distinguish technical fixes from medical, regulatory or business decisions.
5. Implement only low-risk, verifiable improvements.
6. Run available build, type, lint and validation checks.
7. Open a draft pull request when changes are worthwhile.
8. Produce only an audit when no safe improvement is justified.

## Prohibited autonomous actions

- Direct changes to `main`.
- Merge.
- Production deployment.
- Changes to prices, credentials, locations or schedules without verified source data.
- Publication of uncertain clinical claims.
- Fabrication of reviews, results, references or schema data.
- Mass generation of thin pages.

## Pull-request requirements

Every automated PR must include:

- Executive summary.
- Opportunity or defect addressed.
- Files changed.
- Validation performed.
- Expected SEO/AEO or conversion impact.
- Medical, regulatory, brand or operational risks.
- Explicit approval items.

## Escalation

Stop and request approval when a proposed change affects:

- Professional-title wording.
- Medical recommendations.
- Contraindications or adverse-event guidance.
- Public prices or payment policies.
- Advertising or sponsorship.
- Location, schedule or availability.
- Patient data, forms or tracking consent.
