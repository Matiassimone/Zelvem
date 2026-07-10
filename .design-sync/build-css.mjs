// Compiles the Zelvem UI Tailwind v4 source into a static stylesheet for
// design-sync previews. The package ships no compiled CSS by design (apps
// compile it); previews need real utilities, so this produces them from the
// same globals.css the apps import. Deps resolve via the .design-sync ->
// .ds-sync/node_modules symlink (recreate per clone: ln -sfn ../.ds-sync/node_modules .design-sync/node_modules).
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindPostcss from '@tailwindcss/postcss'
import postcss from 'postcss'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const input = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap');
@import 'tailwindcss';
@import '../packages/@zelvem/ui/src/styles/globals.css';
@source '../packages/@zelvem/ui/src';
@source '../.design-sync/previews';
/* Full token vocabulary for the design agent — utilities Tailwind would
   otherwise skip because no shipped source uses them yet. */
@source inline("bg-{paper,surface,moss,moss-hover,on-moss,tint,tint2,chip,dot,avatar,row-hover}");
@source inline("text-{ink,ink2,muted,on-moss,moss}");
@source inline("border-{border,border-soft,accent-border,moss}");
@source inline("font-{sans,mono}");

/* next/font defines these at runtime in the apps; previews bridge to the remote families. */
:root {
  --font-geist: 'Geist';
  --font-geist-mono: 'Geist Mono';
}
`

// Entry lives inside .ds-sync so 'tailwindcss' resolves from its node_modules.
const from = join(root, '.ds-sync', '.ds-preview-entry.css')
writeFileSync(from, input)
const result = await postcss([tailwindPostcss()]).process(input, { from })
const out = join(root, 'packages/@zelvem/ui/.ds-preview.css')
writeFileSync(out, result.css)
console.log(`wrote ${out} (${result.css.length} bytes)`)
