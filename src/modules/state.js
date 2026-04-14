GM_addStyle(desuXStyles);

const prefix = 'ig-';
const SEARCH_LOAD_COOLDOWN_MS = 1500;
const SEARCH_LOAD_RETRY_BASE_MS = 5000;
const SEARCH_LOAD_RETRY_MAX_MS = 30000;

let hoveredMedia = null;
let images = [];
let currentIndex = 0;
let currentPageNumber = 1;
let galleryContainer = null;
let loading = false;
let nextSearchLoadAllowedAt = 0;
let searchRetryDelay = SEARCH_LOAD_RETRY_BASE_MS;
let mediaHoverHandlersAttached = false;
let lastPointerTarget = null;
let lastPointerPosition = null;

const preview = document.createElement('div');
preview.id = 'hover-preview';
document.body.appendChild(preview);
