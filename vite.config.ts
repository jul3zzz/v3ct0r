import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// KaTeX ships every font as woff2 + woff + ttf. Every modern browser reads woff2, so drop
// the two fallbacks before Vite inlines them: the single-file build stays ~1 MB lighter.
function katexWoff2Only(): Plugin {
  return {
    name: 'vm:katex-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!/katex(\.min)?\.css$/.test(id.split('?')[0])) return null;
      return code
        .replace(/,\s*url\([^)]+\.woff\)\s*format\(["']woff["']\)/g, '')
        .replace(/,\s*url\([^)]+\.ttf\)\s*format\(["']truetype["']\)/g, '');
    },
  };
}

// Course voice-overs stay next to index.html (dist/courses/<id>/audio/*.mp3): too big to inline,
// and a file:// page can still play them with <audio>. Their alignment JSON is bundled.
function courseAudio(): Plugin {
  return {
    name: 'vm:course-audio',
    apply: 'build',
    closeBundle() {
      const root = 'courses';
      if (!existsSync(root)) return;
      let n = 0;
      for (const id of readdirSync(root)) {
        const dir = join(root, id, 'audio');
        if (!existsSync(dir)) continue;
        for (const f of readdirSync(dir)) {
          if (!f.endsWith('.mp3')) continue;
          mkdirSync(join('dist', root, id, 'audio'), { recursive: true });
          copyFileSync(join(dir, f), join('dist', root, id, 'audio', f));
          n++;
        }
      }
      if (n) console.log(`course audio: ${n} fichier(s) copiés dans dist/courses/`);
    },
  };
}

// The website installed on a phone (PWA): dist/sw.js from scripts/sw-template.js, with the list of what to keep
// offline (the page, the manifest, the icons of public/, every course voice) and a version that changes with
// them, so that a new deploy replaces the kept copy. Runs after courseAudio (the voices are in dist/ by then).
function pwa(): Plugin {
  return {
    name: 'vm:pwa',
    apply: 'build',
    closeBundle() {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const f of readdirSync(join('dist', dir))) {
          const p = dir ? `${dir}/${f}` : f;
          if (statSync(join('dist', p)).isDirectory()) walk(p);
          else if (p !== 'index.html' && p !== 'sw.js' && !p.endsWith('.zip')) files.push(p);
        }
      };
      walk('');
      files.sort();
      const hash = createHash('sha256').update(readFileSync('dist/index.html'));
      for (const f of files) hash.update(f).update(readFileSync(join('dist', f)));
      const list = ['./', ...files.map((f) => encodeURI(f))];
      const sw = readFileSync('scripts/sw-template.js', 'utf8').replace('__VERSION__', hash.digest('hex').slice(0, 12)).replace('__FILES__', JSON.stringify(list));
      writeFileSync('dist/sw.js', sw);
      console.log(`pwa: dist/sw.js · ${list.length} fichier(s) gardés hors ligne`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [katexWoff2Only(), viteSingleFile({ removeViteModuleLoader: true }), courseAudio(), pwa()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 8000,
    reportCompressedSize: false,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
} as any);
