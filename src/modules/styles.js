const desuXStyles = `
    @import url('https://fonts.googleapis.com/css?family=Roboto');

    body,
    button,
    input,
    select,
    textarea {
        font-family: 'Roboto', sans-serif !important;
    }

    .desux-search-page .paginate {
        display: none !important;
    }

    .desux-search-page article.thread {
        padding: 0 !important;
        border-top: none !important;
    }

    .hidden-by-desux {
        visibility: hidden;
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .desux-post-hidden {
        opacity: 0;
        pointer-events: none;
        user-select: none;
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(100%);
    }

    #backlink .desux-post-hidden,
    .backlink_container .desux-post-hidden {
        opacity: 1 !important;
        pointer-events: auto !important;
        user-select: text !important;
        position: static !important;
        width: auto !important;
        height: auto !important;
        overflow: visible !important;
        clip: auto !important;
        clip-path: none !important;
    }

    #hover-preview {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        pointer-events: none;
        max-width: 100vw;
        max-height: calc(100vh - 25px);
        line-height: 0;
    }

    #hover-preview img,
    #hover-preview embed,
    #hover-preview video {
        display: block;
        width: auto;
        height: auto;
        max-width: 100vw;
        max-height: calc(100vh - 25px);
        object-fit: contain;
    }

    #hover-preview .desux-preview-spinner {
        width: 44px;
        height: 44px;
        margin: 18px;
        border: 4px solid rgba(228, 69, 255, 0.25);
        border-top-color: #e445ff;
        border-radius: 50%;
        background: transparent;
        animation: desux-spin 0.8s linear infinite;
    }

    @keyframes desux-spin {
        to {
            transform: rotate(360deg);
        }
    }

    #hover-preview .desux-preview-note {
        margin-top: 6px;
        padding: 6px 10px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.85);
        color: #f4f4f4;
        font: 13px/1.3 sans-serif;
        white-space: nowrap;
    }

    #desux-check-bar {
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100001;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: calc(100vw - 32px);
        padding: 8px 12px;
        border: 1px solid #e445ff;
        border-top: none;
        border-radius: 0 0 6px 6px;
        background: #1c1c22;
        color: #f4f4f4;
        font: 13px/1.4 sans-serif;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }

    #desux-check-bar button {
        flex: none;
        padding: 4px 10px;
        border: none;
        border-radius: 4px;
        background: #e445ff;
        color: #fff;
        font: inherit;
        cursor: pointer;
    }

    #desux-check-bar button.desux-check-bar-close {
        padding: 0 4px;
        background: transparent;
        color: #aaa;
        font-size: 18px;
    }

    #desux-settings {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
    }

    #desux-settings .desux-settings-panel {
        width: 440px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 32px);
        overflow-y: auto;
        padding: 16px 18px;
        border: 1px solid #3a3a44;
        border-radius: 8px;
        background: #1c1c22;
        color: #f0f0f0;
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    }

    #desux-settings .desux-settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 15px;
        font-weight: 600;
    }

    #desux-settings .desux-settings-header button {
        border: 0;
        padding: 0 6px;
        background: none;
        color: #aaa;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
    }

    #desux-settings .desux-settings-header button:hover {
        color: #e445ff;
    }

    #desux-settings .desux-settings-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 0;
        padding: 8px 6px;
        border-radius: 4px;
        color: inherit;
        cursor: pointer;
    }

    #desux-settings .desux-settings-row:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    #desux-settings .desux-settings-row input {
        margin: 2px 0 0;
        accent-color: #e445ff;
    }

    #desux-settings .desux-settings-row strong,
    #desux-settings .desux-settings-row small {
        display: block;
    }

    #desux-settings .desux-settings-row strong {
        font-weight: 600;
    }

    #desux-settings .desux-settings-row small {
        color: #9a9aa6;
        font-size: 12px;
    }

    #desux-settings .desux-settings-note {
        margin-top: 10px;
        padding: 0 6px;
        color: #777783;
        font-size: 12px;
    }

    #ig-galleryContainer {
        --ig-accent: #e445ff;
        --ig-accent-dim: rgba(228, 69, 255, 0.2);
        --ig-accent-glow: rgba(228, 69, 255, 0.4);
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.95);
        color: #f4f4f4;
        overflow: hidden;
        user-select: none;
    }

    #ig-galleryContainer.ig-thumbnails-hidden #ig-thumbnailBar {
        transform: translateY(100%);
    }

    #ig-galleryContainer.ig-thumbnails-hidden .ig-dock-toggle {
        transform: translateY(0);
    }

    #ig-galleryContainer.ig-thumbnails-hidden .ig-floating-ui {
        bottom: 18px;
    }

    #ig-galleryContainer:not(.ig-thumbnails-hidden) .ig-dock-toggle {
        transform: translateY(-5rem);
    }

    #ig-galleryContainer.ig-fullscreen {
        cursor: none;
    }

    .ig-ui-chrome {
        transition: opacity 0.22s ease, transform 0.22s ease;
    }

    .ig-ui-hidden {
        opacity: 0 !important;
        pointer-events: none !important;
    }

    .ig-toolbar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 12;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 14px 18px;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0));
        pointer-events: auto;
    }

    .ig-toolbar-left,
    .ig-toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .ig-toolbar-right {
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .ig-toolbar-group {
        display: inline-flex;
        align-items: center;
        gap: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
        flex: 0 0 auto;
    }

    .ig-pill {
        display: inline-flex;
        align-items: center;
        padding: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font-size: 14px;
        line-height: 1;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
    }

    .ig-filename {
        max-width: min(42vw, 560px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
        color: rgba(255, 255, 255, 0.9);
    }

    .ig-toolbar-button,
    .ig-toolbar-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.1s ease, color 0.1s ease, background-color 0.1s ease;
    }

    .ig-toolbar-button:hover,
    .ig-toolbar-link:hover {
        transform: scale(1.1);
        color: var(--ig-accent);
    }

    .ig-toolbar-button:active,
    .ig-toolbar-link:active {
        transform: scale(0.9);
    }

    .ig-toolbar-button.is-active {
        color: rgba(255, 255, 255, 0.92);
    }

    .ig-toolbar-button.ig-close-button {
        color: rgba(255, 255, 255, 0.7);
    }

    .ig-toolbar-button.ig-close-button:hover {
        color: #f87171;
    }

    .ig-icon {
        width: 18px;
        height: 18px;
        display: block;
    }

    .ig-slideshow-input {
        box-sizing: border-box;
        width: 44px !important;
        min-width: 44px !important;
        max-width: 44px !important;
        min-height: 34px;
        padding: 0 6px;
        border: none;
        border-left: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 0;
        background: transparent;
        color: #ffffff;
        text-align: center;
        outline: none;
        appearance: textfield;
        -moz-appearance: textfield;
        font-size: 14px;
        line-height: 1;
    }

    .ig-slideshow-input::-webkit-inner-spin-button,
    .ig-slideshow-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .ig-slideshow-input[hidden] {
        display: none !important;
    }

    .ig-slideshow-input:focus {
        background: rgba(255, 255, 255, 0.06);
    }

    .ig-time {
        position: absolute;
        top: 62px;
        left: 20px;
        z-index: 11;
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 12px;
        max-width: min(50vw, 420px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ig-time-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }

    .ig-time-text {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ig-stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ig-media-shell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .ig-media-transform {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: 100%;
        touch-action: none;
        cursor: grab;
        transition: transform 0.12s ease-out;
    }

    .ig-media-transform.is-dragging {
        cursor: grabbing;
        transition: none;
    }

    .ig-media-rotate {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.14s ease-out;
    }

    #ig-galleryImage {
        display: block;
        max-width: min(92vw, 1800px);
        max-height: min(92vh, 1100px);
        object-fit: contain;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.25);
    }

    video#ig-galleryImage {
        pointer-events: none;
    }

    .ig-loading-indicator {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 180px;
        height: 4px;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        overflow: hidden;
        pointer-events: none;
    }

    .ig-loading-indicator::before {
        content: '';
        display: block;
        width: 38%;
        height: 100%;
        border-radius: inherit;
        background: var(--ig-accent);
        animation: ig-shimmer 1s ease-in-out infinite;
    }

    .ig-video-controls {
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 6px;
        width: min(52vw, 560px);
        height: 22px;
        padding: 0 8px;
        border-radius: 0 0 6px 6px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    .ig-video-controls[hidden] {
        display: none !important;
    }

    .ig-video-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        padding: 0;
        border-radius: 0;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
    }

    .ig-video-button:hover {
        color: #ffffff;
    }

    .ig-video-seek {
        flex: 1;
        accent-color: var(--ig-accent);
        cursor: pointer;
        height: 6px;
    }

    .ig-nav-button {
        position: absolute;
        top: 50%;
        z-index: 11;
        width: 64px;
        height: 108px;
        padding: 0;
        background: transparent;
        border: 0;
        cursor: pointer;
        transform: translateY(-50%);
        transition: opacity 0.16s ease, transform 0.16s ease;
        opacity: 0.78;
    }

    .ig-nav-button:hover {
        opacity: 1;
        transform: translateY(-50%) scale(1.04);
    }

    .ig-nav-button:active {
        transform: translateY(-50%) scale(0.98);
    }

    .ig-prev-button {
        left: 0;
    }

    .ig-next-button {
        right: 0;
    }

    .ig-nav-image {
        width: 64px;
        height: 108px;
        display: block;
        filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.5));
        pointer-events: none;
    }

    .ig-floating-ui {
        position: absolute;
        z-index: 11;
        transition: bottom 0.22s ease;
    }

    .ig-meta-overlay {
        right: 18px;
        bottom: 108px;
        padding: 7px 10px;
        border-radius: 10px;
        background: rgba(6, 6, 8, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
    }

    .ig-speed-overlay {
        top: 84px;
        right: 18px;
        padding: 8px 11px;
        border-radius: 10px;
        background: rgba(6, 6, 8, 0.74);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
    }

    .ig-shortcuts {
        left: 18px;
        bottom: 108px;
    }

    .ig-shortcuts-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.4);
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
        padding: 0;
        cursor: default;
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .ig-shortcuts:hover .ig-shortcuts-toggle {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.6);
    }

    .ig-shortcuts-panel {
        position: absolute;
        left: 0;
        bottom: 44px;
        display: none;
        min-width: 248px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(6, 6, 8, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.34);
    }

    .ig-shortcuts:hover .ig-shortcuts-panel {
        display: block;
    }

    .ig-shortcuts-title {
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.45);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .ig-shortcuts-row {
        display: grid;
        grid-template-columns: 74px 1fr;
        gap: 10px;
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
    }

    .ig-shortcuts-key {
        color: rgba(255, 255, 255, 0.46);
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
    }

    .ig-dock-toggle {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 11;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 6px;
        padding: 0;
        border: none;
        border-radius: 0;
        background: #141418;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: transform 0.3s ease-in-out, background-color 0.15s ease, opacity 0.3s ease;
    }

    .ig-dock-toggle:hover {
        background: #1e1e1e;
        color: rgba(255, 255, 255, 0.8);
    }

    .ig-dock-handle {
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 10px;
        border-radius: 6px 6px 0 0;
        background: #141418;
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .ig-dock-toggle:hover .ig-dock-handle {
        background: #1e1e1e;
    }

    #ig-thumbnailBar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 6px;
        height: 80px;
        padding: 8px 12px;
        overflow-x: auto;
        overflow-y: hidden;
        background: #000;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
        transition: transform 0.22s ease;
    }

    #ig-thumbnailBar::-webkit-scrollbar {
        height: 10px;
    }

    #ig-thumbnailBar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.24);
        border-radius: 999px;
    }

    .ig-thumbnail-item {
        position: relative;
        flex: 0 0 auto;
        width: 64px;
        height: 64px;
        padding: 0;
        border: 2px solid transparent;
        border-radius: 8px;
        background: rgba(20, 20, 24, 0.65);
        overflow: hidden;
        cursor: pointer;
        opacity: 0.48;
        transition: transform 0.12s ease, opacity 0.12s ease, border-color 0.12s ease;
    }

    .ig-thumbnail-item:hover {
        opacity: 0.82;
        transform: translateY(-1px);
    }

    .ig-thumbnail-item.ig-active {
        opacity: 1;
        border-color: var(--ig-accent);
        transform: translateY(-1px);
    }

    .ig-thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .ig-thumbnail-video-badge {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .ig-thumbnail-video-badge::before {
        content: '';
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.72);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
    }

    .ig-thumbnail-video-badge::after {
        content: '';
        position: absolute;
        margin-left: 3px;
        border-style: solid;
        border-width: 7px 0 7px 11px;
        border-color: transparent transparent transparent rgba(255, 255, 255, 0.94);
    }

    @media (max-width: 900px) {
        .ig-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
        }

        .ig-toolbar-left,
        .ig-toolbar-right {
            justify-content: center;
        }

        .ig-toolbar-right {
            gap: 8px;
        }

        .ig-filename {
            max-width: 100%;
        }

        .ig-time {
            top: 104px;
            left: 12px;
            right: 12px;
            max-width: none;
        }

        .ig-nav-image {
            width: 58px;
            height: 98px;
        }

        .ig-video-controls {
            width: calc(100vw - 72px);
            left: 14px;
            right: 14px;
            transform: none;
        }

        .ig-meta-overlay,
        .ig-shortcuts {
            bottom: 102px;
        }

        #ig-galleryContainer.ig-thumbnails-hidden .ig-floating-ui {
            bottom: 18px;
        }
    }

    @keyframes ig-shimmer {
        0% {
            transform: translateX(-140%);
        }

        100% {
            transform: translateX(320%);
        }
    }
`;
