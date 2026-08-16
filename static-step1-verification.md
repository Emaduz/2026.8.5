# Static Step 1 Verification

The standalone package for the first Vercel deployment is generated from `dist/public` and receives `vercel.json` at its root. The package must contain `index.html`, `assets/portrait.jpg`, and `vercel.json` before upload.

Run the reproducible smoke check from the project root:

```bash
node scripts/verify-static-step1.mjs /path/to/emadalddine-static-step1
```

The check verifies that the entry HTML, portrait asset, and Vercel rewrite configuration exist, that the HTML references `/assets/`, and that `vercel.json` contains at least one rewrite. The check passed for the generated package at `/home/ubuntu/emadalddine-static-step1` after the package was created.

For GitHub, the contents of the package directory—not the outer directory—must be uploaded to the repository root. For Vercel, the static test uses `Other`, an empty Install Command, an empty Build Command, and `.` as the Output Directory.
