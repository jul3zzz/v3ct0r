import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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

export default defineConfig({
  base: './',
  plugins: [katexWoff2Only(), viteSingleFile({ removeViteModuleLoader: true }), courseAudio()],
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
