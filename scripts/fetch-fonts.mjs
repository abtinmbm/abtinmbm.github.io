// Downloads the site's fonts from Fontshare into public/fonts/ before a build.
// They are not committed: the ITF Free Font License allows self-hosting on
// this site but not redistributing the files through a public repository.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { unzipSync } from 'fflate';

const families = {
  switzer: ['Switzer-Regular.woff2', 'Switzer-Medium.woff2', 'Switzer-Italic.woff2'],
  panchang: ['Panchang-Regular.woff2', 'Panchang-Medium.woff2'],
};
const out = new URL('../public/fonts/', import.meta.url);

const exists = async (u) => access(u).then(() => true, () => false);
await mkdir(out, { recursive: true });

for (const [family, files] of Object.entries(families)) {
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
