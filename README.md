<div align="center">

# DesuX

**Enhancement script for [desuarchive.org](https://desuarchive.org)**

Infinite scrolling &middot; Media preview &middot; Gallery mode &middot; Downloads &middot; Fappe Tyme

[![Install](https://img.shields.io/badge/Install_Userscript-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kpg-anon/DesuX/raw/main/desuX.user.js)

[![Version](https://img.shields.io/badge/version-3.0-E445FF?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## Requirements

A userscript manager such as [Violentmonkey](https://violentmonkey.github.io/), [Tampermonkey](https://www.tampermonkey.net/), or [Greasemonkey](https://www.greasespot.net/).

---

## Features

### Gallery Mode

Full-screen media gallery with pan, zoom, rotation, slideshow, video playback, and keyboard navigation. The thumbnail strip highlights the currently viewed media and the background thread syncs to the corresponding post.

Open with `Alt+G` or click any media thumbnail while the script is active.

<!-- Replace with GitHub-hosted video URL -->
https://i.imgur.com/ESrUZuk.mp4

<details>
<summary><strong>Keyboard shortcuts</strong></summary>
<br>

| Key | Action |
|-----|--------|
| `Left` / `Right` | Previous / Next |
| `Space` | Toggle slideshow |
| `F` | Fullscreen |
| `H` | Flip horizontal |
| `R` | Rotate 90 degrees |
| `S` | Download (preserves transforms) |
| `T` | Toggle thumbnail strip |
| `M` | Mute / unmute video |
| `<` / `>` | Frame step (while paused) |
| `[` / `]` | Decrease / increase playback speed |
| `\` | Reset playback speed |
| `Scroll` | Zoom |
| `Esc` | Close |

</details>

---

### Infinite Scroll

Automatically loads the next page of results as you scroll on both thread and search pages.

<!-- Replace with GitHub-hosted video URL -->
https://i.imgur.com/nprXm8d.mp4

---

### Media Preview on Hover

Hover over any thumbnail to see a full-size preview. Supports images and video.

<!-- Replace with GitHub-hosted video URL -->
https://i.imgur.com/kkB4WVb.mp4

---

### Fappe Tyme

Press `F` to toggle image-only mode. Hides text-only posts and shows only posts with media.

<!-- Replace with GitHub-hosted video URL -->
https://i.imgur.com/MspImEg.mp4

---

### Download

Press `S` while hovering over a thumbnail or viewing media in the gallery to download with the original filename. In gallery mode, flipped or rotated images are saved with transforms applied.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.

---

## Development

Source files live in `src/`. The installable userscript (`desuX.user.js`) is a generated artifact assembled by the build script.

```
src/
  metadata.txt              # userscript header
  main.js                   # bootstrap entrypoint
  assets/base64-icons.js    # embedded icon assets
  react-gallery/
    runtime.jsx             # React gallery component (bundled via esbuild)
  modules/
    styles.js               # injected CSS
    state.js                # shared runtime state
    utils.js                # helper functions
    page.js                 # page-level helpers
    media-index.js          # media discovery and indexing
    hover-preview.js        # hover preview behavior
    search.js               # infinite scroll / search loading
    gallery.js              # gallery rendering and navigation
    download.js             # download and filename handling
    keyboard.js             # keyboard shortcut handling
    bootstrap.js            # startup wiring
build/
  build-userscript.mjs      # zero-dependency build script
```

### Commands

```bash
npm run build   # rebuild desuX.user.js and desuX.meta.js
npm run watch   # rebuild on source changes
npm run check   # syntax-check the generated script
```

### Versioning

Bump the version in `src/metadata.txt`, rebuild, and commit source + generated output together.

---

## License

[MIT](LICENSE)
