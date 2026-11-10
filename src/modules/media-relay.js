// Cloudflare answers full-size files of some boards (/trash/ since 2026-11) with its browser check unless the request
// carries the cf_clearance cookie. Firefox and Chrome keep that cookie only for tabs whose address bar is on the file
// host: an <img> on desuarchive.org and GM_xmlhttpRequest both get the check page (403). A tab on the file host can
// fetch the files, so one background "helper" tab does that and hands the bytes back through GM storage. The helper
// lives on a path the file host answers with its plain 404 page, which Cloudflare does not check.
const MEDIA_HOST = 'desu-usergeneratedcontent.xyz';
const RELAY_REQUESTS_KEY = 'desux-relay-requests';
const RELAY_HELPER_KEY = 'desux-relay-helper';
const RELAY_CLOSE_KEY = 'desux-relay-close';
const RELAY_RESPONSE_PREFIX = 'desux-relay-response:';
const RELAY_HELPER_PATH = '/desux-helper';
const RELAY_CLEARANCE_MS = 30000;
const RELAY_HEARTBEAT_MS = 4000;
const RELAY_HELPER_STALE_MS = 15000;
const RELAY_TIMEOUT_MS = 45000;
const RELAY_ACK_MS = 1200;
const RELAY_REOPEN_MS = 8000;
const RELAY_MAX_OPENS = 2;
const RELAY_HELPER_IDLE_MS = 10 * 60 * 1000;
const RELAY_MAX_BYTES = 32 * 1024 * 1024;
const RELAY_CACHE_SIZE = 24;

if (window.location.hostname !== 'desuarchive.org') {
    // On the file host the script is only ever the helper; none of the desuarchive.org code below runs.
    if (isRelayHelperTab()) {
        runRelayHelper();
    }
    return;
}

function isRelayHelperTab() {
    return window.location.hostname === MEDIA_HOST && window.top === window && window.location.pathname === RELAY_HELPER_PATH;
}

function runRelayHelper() {
    document.title = 'DesuX helper';
    document.body.textContent = 'DesuX helper tab. It loads full-size files for the previews and gallery on desuarchive.org. '
        + 'You can close it; DesuX opens it again when it needs it.';
    document.body.style.cssText = 'margin: 2em; font: 14px sans-serif; color: #ccc; background: #1c1c22;';

    const helperId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const seenRequests = new Set();
    let lastRequestAt = Date.now();
    let stopped = false;

    const beat = () => {
        if (stopped) {
            return;
        }

        if (Date.now() - lastRequestAt > RELAY_HELPER_IDLE_MS) {
            // Unused for a while: stop answering, ask the tab that opened this one to close it, and try directly too.
            stopped = true;
            GM_deleteValue(RELAY_HELPER_KEY);
            GM_setValue(RELAY_CLOSE_KEY, { id: helperId, t: Date.now() });
            window.close();
            return;
        }

        GM_setValue(RELAY_HELPER_KEY, { id: helperId, t: Date.now() });
    };

    const respond = (requestId, response) => {
        GM_setValue(RELAY_RESPONSE_PREFIX + requestId, response);
    };

    // The page's own fetch: it sends the tab's cookies whichever context Violentmonkey runs the script in.
    const pageFetch = typeof unsafeWindow !== 'undefined' && unsafeWindow.fetch ? unsafeWindow.fetch.bind(unsafeWindow) : window.fetch.bind(window);

    // No clearance yet (or it ran out): load the file in a same-origin frame, so Cloudflare's check runs there and
    // sets the cookie for this tab. One frame at a time; every request that met the check waits for it.
    let clearing = null;
    const getClearance = (url) => {
        if (clearing) {
            return clearing;
        }

        clearing = new Promise((resolve) => {
            const frame = document.createElement('iframe');
            frame.style.cssText = 'display: block; width: 480px; height: 360px; margin-top: 1em; border: 1px solid #555;';
            const done = (passed) => {
                window.clearTimeout(timer);
                frame.remove();
                clearing = null;
                resolve(passed);
            };
            const timer = window.setTimeout(() => done(false), RELAY_CLEARANCE_MS);
            frame.addEventListener('load', () => {
                let type = '';
                try {
                    type = frame.contentDocument.contentType || '';
                } catch (error) {
                    // Not readable: still the check page.
                }
                if (/^(?:image|video|audio)\//.test(type)) {
                    done(true);
                }
            });
            frame.src = url;
            document.body.appendChild(frame);
        });

        return clearing;
    };

    const fetchFile = async (url) => {
        let response = await pageFetch(url, { credentials: 'include' });
        if (response.status === 403) {
            console.info('desuX helper: Cloudflare check for', url);
            if (await getClearance(url)) {
                response = await pageFetch(url, { credentials: 'include' });
            }
        }
        return response;
    };

    const answer = async (request) => {
        try {
            const target = new URL(request.url);
            if (target.origin !== window.location.origin) {
                respond(request.id, { ok: false, error: 'not a file host URL' });
                return;
            }

            const response = await fetchFile(target.href);
            const type = (response.headers.get('content-type') || '').split(';')[0].trim();
            if (!response.ok || type === 'text/html') {
                respond(request.id, { ok: false, status: response.status, error: `HTTP ${response.status}` });
                return;
            }

            const blob = await response.blob();
            if (blob.size > RELAY_MAX_BYTES) {
                respond(request.id, { ok: false, error: 'file too large' });
                return;
            }

            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });

            respond(request.id, { ok: true, type: type || blob.type, data: dataUrl.slice(dataUrl.indexOf(',') + 1) });
        } catch (error) {
            console.error('desuX helper:', request.url, error);
            respond(request.id, { ok: false, error: String((error && error.message) || error) });
        }
    };

    const serve = (requests) => {
        if (stopped || !Array.isArray(requests)) {
            return;
        }

        requests.forEach((request) => {
            if (!request || !request.id || seenRequests.has(request.id) || Date.now() - request.t > RELAY_TIMEOUT_MS) {
                return;
            }

            seenRequests.add(request.id);
            lastRequestAt = Date.now();
            // Tell the asking tab at once that a helper is alive, so it does not open another one.
            respond(request.id, { ack: true });
            answer(request);
        });
    };

    GM_addValueChangeListener(RELAY_REQUESTS_KEY, (name, oldValue, newValue) => serve(newValue));
    beat();
    window.setInterval(beat, RELAY_HEARTBEAT_MS);
    serve(GM_getValue(RELAY_REQUESTS_KEY, []));

    window.addEventListener('pagehide', () => {
        const current = GM_getValue(RELAY_HELPER_KEY, null);
        if (current && current.id === helperId) {
            GM_deleteValue(RELAY_HELPER_KEY);
        }
    });
}

// ── desuarchive.org side ──

const relayBlobs = new Map();
const relayDataUrls = new Map();
const relayBlockedPrefixes = new Set();
let relayHelperTab = null;
let relayHelperOpenedAt = 0;

function isRelayableUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && parsed.hostname === MEDIA_HOST;
    } catch (error) {
        return false;
    }
}

// Cloudflare's rule is per board, so one blocked file means the rest of "<host>/<board>/" is blocked too.
function getRelayPrefix(url) {
    const parsed = new URL(url);
    return `${parsed.origin}/${parsed.pathname.split('/')[1] || ''}/`;
}

function isMediaBlocked(url) {
    return isRelayableUrl(url) && relayBlockedPrefixes.has(getRelayPrefix(url));
}

function markMediaBlocked(url) {
    if (isRelayableUrl(url)) {
        relayBlockedPrefixes.add(getRelayPrefix(url));
    }
}

function getPendingRelayRequests() {
    const requests = GM_getValue(RELAY_REQUESTS_KEY, []);
    const now = Date.now();
    return Array.isArray(requests) ? requests.filter(request => request && now - request.t < RELAY_TIMEOUT_MS) : [];
}

function isRelayHelperAlive() {
    const helper = GM_getValue(RELAY_HELPER_KEY, null);
    return Boolean(helper && Date.now() - helper.t < RELAY_HELPER_STALE_MS);
}

/** Opens the helper tab, unless one was opened a moment ago and is still loading. */
function openRelayHelper() {
    if (Date.now() - relayHelperOpenedAt < RELAY_REOPEN_MS) {
        return false;
    }

    relayHelperOpenedAt = Date.now();
    relayHelperTab = GM_openInTab(`https://${MEDIA_HOST}${RELAY_HELPER_PATH}`, { active: false, insert: true });
    return true;
}

function base64ToBlob(base64, type) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: type || 'application/octet-stream' });
}

/** The file's bytes, fetched by the helper tab. One request per URL; the last RELAY_CACHE_SIZE files are kept. */
function fetchMediaViaRelay(url) {
    const cached = relayBlobs.get(url);
    if (cached) {
        return cached;
    }

    if (!isSettingEnabled('helperTab')) {
        return Promise.reject(new Error('the helper tab is switched off in DesuX settings'));
    }

    const pending = new Promise((resolve, reject) => {
        const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const responseKey = RELAY_RESPONSE_PREFIX + requestId;
        let listenerId = null;
        let timer = 0;
        let ackTimer = 0;
        let acknowledged = false;
        let opens = 0;

        // The helper's heartbeat can be stale either way: a closed tab's last beat stays readable for a while, and
        // a background tab's timers run late. So the request itself is the test: a live helper acknowledges it at
        // once, and while there is no acknowledgement a helper tab is opened (again, if the first one went away).
        const watchHelper = () => {
            if (acknowledged) {
                return;
            }
            if (opens < RELAY_MAX_OPENS && openRelayHelper()) {
                opens += 1;
            }
            ackTimer = window.setTimeout(watchHelper, RELAY_ACK_MS);
        };

        const finish = (error, blob) => {
            GM_removeValueChangeListener(listenerId);
            window.clearTimeout(timer);
            window.clearTimeout(ackTimer);
            GM_deleteValue(responseKey);
            GM_setValue(RELAY_REQUESTS_KEY, getPendingRelayRequests().filter(request => request.id !== requestId));
            if (error) {
                reject(error);
            } else {
                resolve(blob);
            }
        };

        listenerId = GM_addValueChangeListener(responseKey, (name, oldValue, response) => {
            if (!response) {
                return;
            }

            acknowledged = true;
            window.clearTimeout(ackTimer);
            if (response.ack) {
                return;
            }

            if (!response.ok) {
                finish(new Error(response.error || 'relay failed'));
                return;
            }

            let blob;
            try {
                blob = base64ToBlob(response.data, response.type);
            } catch (error) {
                finish(error);
                return;
            }

            markMediaBlocked(url);
            finish(null, blob);
        });

        timer = window.setTimeout(() => finish(new Error('The helper tab did not answer.')), RELAY_TIMEOUT_MS);
        GM_setValue(RELAY_REQUESTS_KEY, [...getPendingRelayRequests(), { id: requestId, url, t: Date.now() }]);
        if (isRelayHelperAlive()) {
            ackTimer = window.setTimeout(watchHelper, RELAY_ACK_MS);
        } else {
            watchHelper();
        }
    });

    relayBlobs.set(url, pending);
    pending.catch(() => relayBlobs.delete(url));

    while (relayBlobs.size > RELAY_CACHE_SIZE) {
        const oldest = relayBlobs.keys().next().value;
        relayBlobs.delete(oldest);
        relayDataUrls.delete(oldest);
    }

    return pending;
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

/**
 * A data: URL for a file that cannot be loaded from its own URL. Not a blob: URL: desuarchive.org's
 * Content-Security-Policy allows data: for <video> and <embed> but blob: for nothing.
 */
function getRelayDataUrl(url) {
    if (!relayDataUrls.has(url)) {
        const pending = fetchMediaViaRelay(url).then(blobToDataUrl);
        relayDataUrls.set(url, pending);
        pending.catch(() => relayDataUrls.delete(url));
    }

    return relayDataUrls.get(url);
}

/** The file's bytes for saving: GM_xmlhttpRequest, or the helper tab where Cloudflare turns that away. */
function fetchMediaBlob(url) {
    if (isMediaBlocked(url)) {
        return fetchMediaViaRelay(url);
    }

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url,
            responseType: 'blob',
            onload(response) {
                if (response.status >= 200 && response.status < 300 && response.response) {
                    resolve(response.response);
                } else if (response.status === 403 && isRelayableUrl(url)) {
                    fetchMediaViaRelay(url).then(resolve, reject);
                } else {
                    reject(new Error(`HTTP ${response.status}`));
                }
            },
            onerror: reject
        });
    });
}

function initializeMediaRelay() {
    // Responses left behind by a tab that was closed before it read them.
    GM_listValues().forEach((key) => {
        if (key.startsWith(RELAY_RESPONSE_PREFIX) && Date.now() - parseInt(key.slice(RELAY_RESPONSE_PREFIX.length), 10) > 2 * RELAY_TIMEOUT_MS) {
            GM_deleteValue(key);
        }
    });

    // The helper cannot close itself; the tab that opened it can.
    GM_addValueChangeListener(RELAY_CLOSE_KEY, () => {
        if (relayHelperTab) {
            relayHelperTab.close();
            relayHelperTab = null;
        }
    });
}
