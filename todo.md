# Strict Disciplined Deployment Workflow

- [x] Phase 1: Freeze approved visual design, typography, and original portrait asset
- [x] Phase 2: Deploy and verify the stable public frontend on Vercel
- [x] Phase 3: Validate the production backend server strategy and database contract
- [x] Phase 4: Connect database and authentication increment
- [x] Phase 5: Enable the admin control panel and content management
- [x] Phase 6: Final production sign-off

- [x] Package the corrected static frontend as emadalddine-step2-frontend-verified.zip for the deployment verification phase

## Phase 4 Database and Authentication

- [x] Generate and review Drizzle migration for bilingual CMS columns
- [x] Apply the reviewed migration to the target database
- [x] Validate the API health path and database-backed public content query
- [x] Validate admin password session creation, refresh, and logout
- [x] Replace EMAD with EmadAlddine globally
- [x] Set dark-mode heading color to #f3d9cb and subheading/small text to #f7eee5
- [x] Keep top navigation bar LTR/fixed direction regardless of Arabic locale switch
- [x] Remove phone number from Hero section
- [x] Fit portrait image inside circular frame covering full width/height
- [x] Package the latest website code into emadalddine-latest-update.zip for GitHub upload
- [x] Explain the video transition mechanics and evaluate its suitability for the portfolio
- [x] Implement tiered scroll-reveal motion across Home and inner pages
- [x] Package a root-level emadalddine-root.zip without nested project folders
- [x] Completely remove hero-phone-line JSX from Home.tsx so the phone row no longer renders
- [x] Completely remove WhatsApp button from Hero section while keeping floating WhatsApp button
- [x] Improve dark-mode service-card text contrast (#f3d9cb and #f7eee5)
- [x] Hide Testimonials from public site and Admin navigation
- [x] Replace Featured Work drag with arrow controls and make project cards fully clickable
- [x] Reduce vertical spacing between project images on mobile and remove stage-count card
- [x] Keep Senior Graphic Designer in English in header across both languages
- [x] Create a complete ZIP from the latest stable website version with project files at archive root
- [x] Verify ZIP structure has no extra nested project directory
- [x] Deliver the ZIP archive to the user
- [x] Remove the testimonials section from the public Home page
- [x] Verify the testimonials section is absent from rendered Home output
- [x] Package the modified Home.tsx as a ZIP for upload
- [x] Diagnose why Page Editor settings do not affect public pages
- [x] Connect saved page design settings to public page rendering for all supported controls
- [x] Add regression tests for saving and applying page design settings
- [x] Verify Page Editor changes visually on a public page
- [x] Wire About sectionOrder to independently rendered experience and skills sections
- [x] Add the Services CTA to the supported sectionOrder model and apply its public ordering
- [x] Expand regression tests across Home, Portfolio, About, Services, and Contact for saved settings including order, alignment, hero image, and button colors
- [x] Add DOM integration tests verifying saved page editor settings on Portfolio, About, Services, and Contact
- [x] Strengthen multi-page DOM assertions to verify alignment classes, hero image rendering, button CSS variables, and section order
- [ ] Package the latest Page Editor fix and 50-test version as a root-level ZIP for GitHub upload
- [ ] Verify the new ZIP contents and checksum
- [ ] Continue live-domain comparison against the latest local build without changing the domain
