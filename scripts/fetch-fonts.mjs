// Downloads the site's fonts into public/fonts/ before a build. They are not committed:
// - Satoshi comes from Fontshare (ITF Free Font License: self-hosting on this site is fine,
//   redistributing the files through a public repository is not).
// - Departure Mono (SIL Open Font License) comes from its public repository.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { unzipSync } from 'fflate';

const out = new URL('../public/fonts/', import.meta.url);
const exists = async (u) => access(u).then(() => true, () => false);
await mkdir(out, { recursive: true });

// Fontshare families: zip download, take the web variable font.
const fontshare = { satoshi: ['Satoshi-Variable.woff2'] };
for (const [family, files] of Object.entries(fontshare)) {
  const have = await Promise.all(files.map((f) => exists(new URL(f, out))));
  if (have.every(Boolean)) continue;
  const res = await fetch(`https://api.fontshare.com/v2/fonts/download/${family}`);
  if (!res.ok) throw new Error(`Font download failed for ${family}: ${res.status}`);
  const zip = unzipSync(new Uint8Array(await res.arrayBuffer()));
  for (const f of files) {
    const entry = Object.keys(zip).find((p) => p.endsWith(`/WEB/fonts/${f}`));
    if (!entry) throw new Error(`${f} not found in the ${family} download`);
    await writeFile(new URL(f, out), zip[entry]);
  }
  console.log(`fonts: ${family} ready`);
}

// Single files by URL, pinned to a release.
const direct = {
  'DepartureMono-Regular.woff2': 'https://cdn.jsdelivr.net/gh/rektdeckard/departure-mono@v1.500/public/assets/DepartureMono-Regular.woff2',
};
for (const [f, url] of Object.entries(direct)) {
  if (await exists(new URL(f, out))) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font download failed for ${f}: ${res.status}`);
  await writeFile(new URL(f, out), new Uint8Array(await res.arrayBuffer()));
  console.log(`fonts: ${f} ready`);
}
