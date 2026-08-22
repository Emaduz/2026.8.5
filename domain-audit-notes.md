# Domain audit notes — 2026-08-22

## Live domain checked

The live domain `https://emadalddine.com/` serves a bilingual portfolio build with the same general brand shell, but its Home content differs from the latest local checkpoint. The live Home hero displays `A sight to Future`, while the latest local source defaults to `Creative Design Solutions`. The live Home also shows project arrow controls and clickable featured-work cards, and it still exposes a phone number in the footer/contact content (the latest local request only removed the phone from the Hero, not the site-wide footer).

The live Home page exposes eight featured projects and eight services. It also exposes a Journal/Notes & updates section. The live extracted content did not show the public Testimonials section, which is consistent with the latest local change.

The live Portfolio page shows `Projects with a point of view.` and the full eight-project grid with `View visual story` links. The portfolio page has no visible live Hero image in the captured viewport and still uses the existing public copy. The live pages use `https://media.emadalddine.com/...` asset URLs for project images and `/api/logo` and `/api/portrait?v=9` for protected site assets.

The live domain's extracted content and screenshot are evidence of the deployed build only; no files or settings were modified during this audit.

## Additional live pages checked

The live About page displays the existing `About Me` hero and current English copy, with the portrait, personal information, languages, experience, skills, and CTA. It does not visibly show a customized page-editor hero image or any user-specific page-editor title from the latest local implementation. The experience and skills sections appear in their normal fixed layout.

The live Services page displays the existing `Professional design solutions` hero, eight service cards, the design-process section, and the Ready to Get Started CTA. The eight cards and direct WhatsApp package links are present. The page still displays the current deployed copy and normal ordering; no evidence of a custom saved Page Editor image, alignment, button-color override, or reordered CTA is visible in the live output.

No project files, database rows, domain settings, or deployment settings were changed during this audit.

## Build fingerprint comparison

The live domain references `/assets/index-DGqZd6mE.js` and `/assets/index-BVbusoMI.css`. The current local production build references `/assets/index-DU1vO6m1.js` and `/assets/index-BMpwo_Wy.css`. The live response has `server: railway-hikari`, `x-powered-by: Express`, and `last-modified: Sat, 22 Aug 2026 11:16:29 GMT`; it is therefore being served by the Railway deployment rather than the local Manus preview.

The live JavaScript bundle contains the old content marker `Creative Design Solutions` and the Featured Work arrow marker, but it contains no `page-editor-surface` or `page_editor_contact` marker. The current local source/build contains Page Editor surface markers and does not contain the old `A sight to Future` hero title. This is direct evidence that the Page Editor public-wiring changes in the latest local version are not in the deployed Railway bundle.

The live domain's old content and asset hashes explain the observed mismatch: the public deployment is a previous build, not the latest local checkpoint. The domain already includes several older refinements (eight services, arrow carousel, clickable project links, no public Testimonials), so the deployment is not an empty or completely unrelated site; it is simply behind the latest source.

## Root-cause evidence from the live API

The live `content.publicHome` API returns Page Editor rows for `page_editor_home`, `page_editor_portfolio`, and `page_editor_services`, including saved titles, alignment, icon style, spacing, and section order. The live API therefore has the editor records; the data layer is not the primary missing piece.

The deployed frontend bundle is older than the current local bundle. The live HTML was last modified at 11:16, while the live Services Page Editor row was updated at 11:19. The live JavaScript bundle has no `page-editor-surface` or `page_editor_contact` marker, whereas the local latest ZIP contains `PageEditorSurface`, `page-editor-hero-image`, `getPageEditorSectionStyle`, and the page-editor keys. This proves the main mismatch is deployment: the current domain serves an older frontend build that does not contain the public Page Editor wiring, even though the remote API/database already contains Page Editor records.

The latest archive is `/home/ubuntu/emadalddine-page-editor-fix.zip`, size approximately 1.1 MB, SHA-256 `75c16e7bbf251a81a462859131b4fb767a2f9e96333ac88cdd5fa4fd0c30ecb9`. It contains the required source files at repository root paths and excludes node_modules, .git, .manus-logs, and dist.
