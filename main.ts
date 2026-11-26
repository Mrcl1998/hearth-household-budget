// Hearth Budget — the hand-in program (Node 22, standard library only).
//
// It hands the site in: copies this repository's app/ and screenshots/ into
// the output directory and writes /output/dossier.json, the summary the judge
// reads, using the vendored make.fun library. vendor/makefun-frontend.ts is
// the kit's copy, unchanged: the scorer rebuilds the dossier with its own
// copy and requires the two to match byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The grader runs this as an unprivileged user on a read-only repo, then a
// different user reads the output, so every file copied out is made
// world-readable (0o644) and every directory world-traversable (0o755). The
// output directory itself is left alone: the grader owns it and this program
// cannot chmod it.

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function makeReadable(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      chmodSync(path, 0o755);
      makeReadable(path);
    } else if (st.isFile()) {
      chmodSync(path, 0o644);
    }
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 16 MiB of
// app files: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
chmodSync(join(out, 'dossier.json'), 0o644);
makeReadable(join(out, 'app'));
makeReadable(join(out, 'screenshots'));
