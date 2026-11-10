# Changelog

All notable changes to `desuX` will be documented here.

## [3.1.0] - 2026-11-10

### Added

- Settings menu, opened from the **DesuX** link in the site's top bar or the userscript manager's menu. Hover preview, infinite scroll, gallery mode, the `S` download key, the `F` Fappe Tyme key and the helper tab can each be switched off. Settings are shared between tabs and apply at once.
- Helper tab for files behind Desuarchive's Cloudflare check (see "Blocked files and the helper tab" in the README). One background tab on `desu-usergeneratedcontent.xyz/desux-helper` fetches the files that a desuarchive.org page is refused and passes them back.
- Mouse wheel scrolls the gallery's thumbnail strip.
- `desuX.greasyfork.user.js`, a build output with the Greasy Fork listing's namespace and no update URLs, for Greasy Fork to sync from.

### Changed

- The hover preview is placed beside the pointer and follows it, the way 4chan X places its image hover, instead of sitting in the centre of the window.
- A file that has to come through the helper tab shows a spinner until it has loaded.
- Versions are now three-part (`3.1.0`).
- The build takes its packages from `DESUX_DEPS_DIR` / `DESUX_ESBUILD_DIR` or sibling project folders; the old hard-coded paths no longer existed. The gallery bundle is now built with React 19.2.3 and Tailwind 4.3.3.

### Fixed

- Hover previews, the gallery and `S` downloads on boards whose full-size files Cloudflare checks (`/trash/` since November 2026). They showed a broken image, or saved an HTML page.

## [3.0] - 2026-04-14

### Added

- Complete gallery UI overhaul: ported the React-based gallery from the 4chmg2 project, rendered inside a Shadow DOM with compiled Tailwind CSS.
- Gallery now features a full-screen lightbox with pan, zoom (scroll wheel), pinch-to-zoom, and keyboard navigation.
- Thumbnail strip with pink accent border highlighting the currently viewed media, toggled with `T`.
- Slideshow mode with configurable interval (Space to toggle).
- Image flip (`H`) and rotation (`R`) with transforms preserved on download.
- Video player with inline seekbar, play/pause, mute, frame stepping (`< >`), and playback speed controls (`[ ]`).
- Keyboard shortcut overlay (hover `K` badge in gallery).
- Fullscreen mode (`F`) with auto-hiding overlay.
- File size and resolution displayed in gallery info overlay.
- Thread scroll sync: navigating media in the gallery updates the URL hash and scrolls the background thread to the corresponding post (thread pages only).
- Cross-origin download support via `GM_xmlhttpRequest` blob fetch, bypassing CORS restrictions.
- Transformed image downloads: flipped/rotated images are rendered to canvas via `createImageBitmap` and saved with transforms applied.
- Gallery works on search result pages, collecting all media including items loaded via infinite scroll.

### Changed

- Moved to a modular source layout under `src/modules/` with a build pipeline in `build/build-userscript.mjs`.
- Gallery navigation arrows now use Lucide `ChevronLeft`/`ChevronRight` icons, vertically centered relative to the visible media area (adjusts for thumbnail strip).
- Updated `@downloadURL` and `@updateURL` to point to the new repository at `github.com/kpg-anon/DesuX`.
- Added `@license MIT` to userscript metadata.
- File metadata parsing now handles KiB/MiB/GiB units used by desuarchive.
- Media collection runs every time the gallery opens (not just on first open), so new items from infinite scroll are always included.

### Fixed

- Fixed Tailwind CSS candidate extraction losing class names inside template literal expressions, which caused missing hover/opacity/border utilities.
- Fixed nav arrow images blocked by Content Security Policy (`img-src` rejecting `data:` and `blob:` URLs) by switching to inline SVG.
- Fixed thumbnail strip border not visible due to Tailwind v4 `@property --tw-border-style` defaulting to `none` in Shadow DOM.
- Fixed download button navigating away instead of saving files by delegating to `GM_xmlhttpRequest` for cross-origin blob downloads.
- Fixed file size not displaying in gallery overlay due to metadata extraction stopping before the size text node and regex not matching `KiB`/`MiB` units.
- Narrowed the Roboto font override so it no longer breaks Font Awesome or other icon fonts on the page.
- Improved search-page loading with better request pacing and media deduplication.

## [2.6] - 2026-04-13

### Added

- Added a gallery overlay play badge for video thumbnails so `webm` and `mp4` items are easier to distinguish from still images.

### Changed

- Bumped the userscript version to `2.6`.
- Narrowed the Roboto font override so it no longer breaks Font Awesome or other icon fonts on the page.
- Improved search-page loading behavior to reduce rate-limit pressure with better request pacing and media deduplication.
- Improved the `S` hotkey download flow so saving hovered media is more reliable.

### Fixed

- Fixed the image-only `F` toggle so reply quote hover previews continue to work while hidden posts remain filtered from normal view.
