import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const workspaceDir = path.resolve(rootDir, '..', '..');
const generatedDir = path.join(rootDir, 'src', 'generated');
const reactGalleryEntryPath = path.join(rootDir, 'src', 'react-gallery', 'runtime.jsx');
const reactGalleryRuntimePath = path.join(generatedDir, 'react-gallery-runtime.js');
const reactGalleryStylesPath = path.join(generatedDir, 'react-gallery-styles.js');
const tailwindBaseDir = path.join(workspaceDir, '4chmg2');
const tailwindNodePath = path.join(tailwindBaseDir, 'node_modules', '@tailwindcss', 'node', 'dist', 'index.mjs');
const esbuildPath = path.join(workspaceDir, 'comfysort', 'node_modules', 'esbuild', 'lib', 'main.js');
const reactNodeModulesPath = path.join(workspaceDir, '4chmg2', 'node_modules');

const metadataPath = path.join(rootDir, 'src', 'metadata.txt');
const sourceFiles = [
  path.join(rootDir, 'src', 'modules', 'styles.js'),
  path.join(rootDir, 'src', 'assets', 'base64-icons.js'),
  reactGalleryStylesPath,
  reactGalleryRuntimePath,
  path.join(rootDir, 'src', 'modules', 'state.js'),
  path.join(rootDir, 'src', 'modules', 'utils.js'),
  path.join(rootDir, 'src', 'modules', 'page.js'),
  path.join(rootDir, 'src', 'modules', 'media-index.js'),
  path.join(rootDir, 'src', 'modules', 'hover-preview.js'),
  path.join(rootDir, 'src', 'modules', 'search.js'),
  path.join(rootDir, 'src', 'modules', 'gallery.js'),
  path.join(rootDir, 'src', 'modules', 'download.js'),
  path.join(rootDir, 'src', 'modules', 'keyboard.js'),
  path.join(rootDir, 'src', 'modules', 'bootstrap.js'),
  path.join(rootDir, 'src', 'main.js')
];

const outputs = [
  path.join(rootDir, 'desuX.user.js'),
  path.join(rootDir, 'dist', 'desuX.user.js')
];

const metaOutputs = [
  path.join(rootDir, 'desuX.meta.js'),
  path.join(rootDir, 'dist', 'desuX.meta.js')
];

const devOutputs = [
  path.join(rootDir, 'desuX-dev.user.js'),
  path.join(rootDir, 'dist', 'desuX-dev.user.js')
];

const devMetaOutputs = [
  path.join(rootDir, 'desuX-dev.meta.js'),
  path.join(rootDir, 'dist', 'desuX-dev.meta.js')
];

const reactGalleryCustomCss = `
:host {
  color: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --bg-base: #141418;
  --bg-surface: #1c1c22;
  --bg-elevated: #222228;
  --border: #2a2a32;
  --accent: #E445FF;
  --accent-dim: rgba(228, 69, 255, 0.2);
  --accent-glow: rgba(228, 69, 255, 0.4);
  --text-primary: #f0f0f0;
  --text-secondary: #a0a0a8;
  --text-muted: #606068;
}

::selection {
  background-color: var(--accent);
  color: white;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-base);
}

::-webkit-scrollbar-thumb {
  background: #3a3a42;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

@keyframes speedOverlay {
  0%, 75% { opacity: 1; }
  100% { opacity: 0; }
}

input[type="range"].video-seekbar {
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  height: 6px;
  border-radius: 0;
}

input[type="range"].video-seekbar::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
}

input[type="range"].video-seekbar::-moz-range-track {
  height: 6px;
  background: transparent;
}

input[type="range"].video-seekbar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0;
  height: 0;
  border: none;
}

input[type="range"].video-seekbar::-moz-range-thumb {
  width: 0;
  height: 0;
  border: none;
}

input[type="range"].video-seekbar::-moz-range-progress {
  height: 6px;
  background: var(--accent);
}
`.trim();

function extractTailwindCandidates(source) {
  const candidates = new Set();

  function addTokens(str) {
    for (const token of str.split(/\s+/)) {
      if (!token || token === 'use' || token === 'client') {
        continue;
      }
      if (/^[A-Za-z0-9!:[\]().,%#/\\_-]+$/.test(token)) {
        candidates.add(token);
      }
    }
  }

  const stringMatches = source.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g);

  for (const match of stringMatches) {
    const quote = match[1];
    const rawValue = match[2];

    if (quote === '`') {
      // Extract candidates from string literals inside ${} expressions
      for (const expr of rawValue.matchAll(/\$\{([^}]+)\}/g)) {
        for (const inner of expr[1].matchAll(/(['"])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
          addTokens(inner[2]);
        }
      }
      // Extract candidates from static template content
      addTokens(rawValue.replace(/\$\{[^}]+\}/g, ' '));
    } else {
      addTokens(rawValue);
    }
  }

  return Array.from(candidates);
}

async function buildReactGalleryArtifacts() {
  await mkdir(generatedDir, { recursive: true });

  const [{ build }, { compile }] = await Promise.all([
    import(pathToFileURL(esbuildPath).href),
    import(pathToFileURL(tailwindNodePath).href)
  ]);

  const reactGallerySource = await readFile(reactGalleryEntryPath, 'utf8');
  const candidates = extractTailwindCandidates(reactGallerySource);
  const tailwind = await compile('@import "tailwindcss";', {
    base: tailwindBaseDir,
    onDependency() {}
  });
  const tailwindCss = tailwind.build(candidates);

  const bundle = await build({
    entryPoints: [reactGalleryEntryPath],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['chrome109'],
    jsx: 'automatic',
    nodePaths: [reactNodeModulesPath],
    logLevel: 'silent'
  });

  const runtimeBundle = bundle.outputFiles[0].text.trimEnd();
  const styleModule = `const desuXReactGalleryStyles = ${JSON.stringify(`${reactGalleryCustomCss}\n\n${tailwindCss}`)};\n`;
  const runtimeModule = `// Generated by build/build-userscript.mjs. Edit files in src/react-gallery/ instead.\n${runtimeBundle}\n`;

  await Promise.all([
    writeFile(reactGalleryStylesPath, styleModule),
    writeFile(reactGalleryRuntimePath, runtimeModule)
  ]);
}

function transformMetadata(metadata, mode) {
  if (mode !== 'dev') {
    return metadata;
  }

  return metadata
    .replace(/^\/\/ @name(\s+)(.+)$/m, '// @name$1$2 [dev]')
    .replace(/^\/\/ @namespace(\s+)(.+)$/m, '// @namespace$1$2/dev')
    .replace(/^\/\/ @description(\s+)(.+)$/m, '// @description$1[DEV BUILD] $2')
    .replace(/^\/\/ @version(\s+)(.+)$/m, '// @version$1$2-dev')
    .replace(/^\/\/ @downloadURL.*\n?/m, '')
    .replace(/^\/\/ @updateURL.*\n?/m, '')
    .trimEnd();
}

await mkdir(path.join(rootDir, 'dist'), { recursive: true });
await buildReactGalleryArtifacts();

const metadata = (await readFile(metadataPath, 'utf8')).trimEnd();
const parts = await Promise.all(sourceFiles.map(file => readFile(file, 'utf8')));
const body = parts.map(part => part.trimEnd()).join('\n\n');
const devMetadata = transformMetadata(metadata, 'dev');

const generated = `${metadata}

// Generated by build/build-userscript.mjs. Edit files in src/ instead.
(function() {
    'use strict';

${body}
})();
`;

const devGenerated = `${devMetadata}

// Generated by build/build-userscript.mjs. Edit files in src/ instead.
(function() {
    'use strict';

${body}
})();
`;

await Promise.all(outputs.map(file => writeFile(file, generated)));
await Promise.all(metaOutputs.map(file => writeFile(file, metadata + '\n')));
await Promise.all(devOutputs.map(file => writeFile(file, devGenerated)));
await Promise.all(devMetaOutputs.map(file => writeFile(file, devMetadata + '\n')));

console.log('Built userscripts:', [
  ...outputs,
  ...devOutputs
].map(file => path.relative(rootDir, file)).join(', '));
