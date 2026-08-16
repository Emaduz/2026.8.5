# Services validation notes

- The public `/services` route now renders a reference-style beige hero, five editable service cards, a four-step red process section, a WhatsApp CTA, and the existing site footer.
- Desktop cards show the requested reference content: Logo Design, Brand Identity, Print Design, Web Design, and Social Media Design, with feature lists, starting prices, and a Most Popular badge.
- The mobile `/services` preview stacks all five cards and the process steps without horizontal overflow; the Arabic/RTL styling hooks are scoped in CSS.
- The portrait framing rule now explicitly uses `object-position: 50% 60%` for the contained source, creating additional top breathing room while preserving the existing three Orbit selectors. The About preview still shows the portrait and shoulders cleanly.
- Validation completed after these changes: `pnpm check`, `pnpm test` (37 passing), and `pnpm build` succeeded.
