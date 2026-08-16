# Behance source notes

Retrieved from the user's Behance projects page on 2026-08-12.

## Profile page

Source URL: https://www.behance.net/emadalddine/projects

The public project list currently includes, in order: ERA shopping Logo Brand; A graphic engineer - EmadAlddine Portfolio; Baha’a Silver Logo - typography; Ekleel Alenayah Medical Company Logo Brand; Caesar logo & Brand; AL KHATTABI PRESS LOGO & IDENTITY; Sama Albait Logo Branding; Al-Bakeli Dental Clinic; Balsam Taibah Medical Co. Logo Branding; Mohammed Omar Designer Logo; Jenan Yemeni Honey Logo Branding; Jawaher Al-Alamia Exchange.

The first three project gallery URLs are:

- https://www.behance.net/gallery/240072049/ERA-shopping-Logo-Brand
- https://www.behance.net/gallery/214380481/A-graphic-engineer-EmadAlddine-Portfolio
- https://www.behance.net/gallery/212641103/Bahaa-Silver-Logo-typography

## First project details

Project: ERA shopping Logo Brand.
Project URL: https://www.behance.net/gallery/240072049/ERA-shopping-Logo-Brand
The page exposes a sequence of project modules under `/modules/`, with at least the following module IDs: 1382745903, 1382745877, 1382745875, 1382745891, 1382745905, 1382745883, 1382745921, 1382745887, 1382745885, 1382745879, 1382745917, 1382745899, 1382745909, 1382745881, 1382745897, 1382745901, 1382745895, 1382745893, and 1382745889.

The first module image URL is:
https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/06551d240072049.693708b93fbdf.jpeg

Additional module image URLs were exposed in the extracted page markdown; the project is suitable for a nested carousel because it contains a logo presentation, applications, patterns, and brand visuals. The public site should copy or persist image URLs/assets and use local project data, without showing Behance's header, branding, appreciation counts, or external navigation.

## Implementation decision

The portfolio UI will use a parent carousel of projects and a child carousel of slides/pages within the selected project. Project records will store source metadata and child slides. A future/explicit import action can refresh data from the user's Behance URL; the public UI will remain local and Behance-free.

## Second project details

Project: A graphic engineer - EmadAlddine Portfolio.
Project URL: https://www.behance.net/gallery/214380481/A-graphic-engineer-EmadAlddine-Portfolio
The page exposes a long sequence of modules, including module IDs 1219894271, 1219894285, 1219894265, 1219894263, 1219894273, 1219894259, 1219894275, 1219894283, 1219894293, 1219894257, 1219894287, 1219894301, 1219894277, 1219894279, 1219894295, 1219894267, 1219894303, 1219894297, 1219894261, 1219894289, 1219894281, 1219894305, 1219894307, 1219894291, 1219894299, 1219894311, 1219894313, 1219894309, 1219894315, 1219894321, 1219894317, 1219894323, 1219894319, 1219894333, 1219894331, 1219894327, 1219894337, 1219894339, 1219894329, 1219894325, 1219894341, and 1219894335.

The primary visible portfolio cover is an editorial composition combining a portrait, Arabic typography, and a portfolio title. The project is suitable for a nested carousel showing cover, typography, layout system, applications, and process stages in the local public presentation.

## Module fidelity check

The Behance project page visibly exposes the actual internal module sequence and confirms that the first modules are a portfolio cover with Arabic/Latin typography, followed by additional presentation modules. Direct permalink-style module URLs are not independently addressable as pages, so the local implementation must store the visible module artwork as local slide assets while preserving the original Behance gallery URL only as administrative source metadata.

## Local module assets

Saved from the visible Behance project module imagery:
- `/home/ubuntu/webdev-static-assets/emadalddine/behance/portfolio-cover-module.webp` — portfolio cover module.
- `/home/ubuntu/webdev-static-assets/emadalddine/behance/portfolio-typography-module.webp` — second visible typography/presentation module.

These are local copies and will be uploaded to project storage before being referenced by the database.

## ERA module URLs

The ERA gallery exposes actual module artwork through these public CDN paths:
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/06551d240072049.693708b93fbdf.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/83cc90240072049.693708b9371c6.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/4697e9240072049.693708b9366d7.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/20b35c240072049.693708b93b32b.jpeg`

The first three are used as the actual logo, presentation, and application modules for the local ERA carousel after download and upload.

## Baha'a Silver module URLs

The Baha'a Silver gallery exposes actual module artwork through these CDN paths:
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/fc1142212641103.6738797cac76d.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/7fba01212641103.6738797cad501.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/76b3fe212641103.6738797cae182.jpeg`
- `https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/174b89212641103.6738797cab9fa.jpeg`

The first three correspond to the visible logo presentation, logo idea, and color/identity explanation modules used for the local Baha'a carousel.
