const SETTINGS_KEY = 'desux-settings';
const SETTING_DEFINITIONS = [
    { key: 'hoverPreview', label: 'Media preview on hover', hint: 'Shows the full image or video next to the pointer while it is over a thumbnail.' },
    { key: 'infiniteScroll', label: 'Infinite scroll on search pages', hint: 'Loads the next page of results when you reach the bottom.' },
    { key: 'gallery', label: 'Gallery mode', hint: 'Alt+G opens every file on the page in a viewer.' },
    { key: 'downloadKey', label: 'Download with S', hint: 'S saves the file under the pointer with its original filename.' },
    { key: 'imageOnlyKey', label: 'Fappe Tyme with F', hint: 'F hides posts without a file on thread pages.' },
    { key: 'helperTab', label: 'Helper tab for blocked files', hint: 'Boards whose full-size files sit behind a Cloudflare check are loaded through one background tab. Off: those files do not load.' }
];

let settings = readSettings();
let settingsDialog = null;

function readSettings() {
    const stored = GM_getValue(SETTINGS_KEY, null);
    const merged = {};
    SETTING_DEFINITIONS.forEach((definition) => {
        // Everything is on unless it was switched off.
        merged[definition.key] = !(stored && stored[definition.key] === false);
    });
    return merged;
}

function isSettingEnabled(key) {
    return settings[key] !== false;
}

function applySettings() {
    if (!isSettingEnabled('hoverPreview') && hoveredMedia) {
        setHoveredMedia(null);
    }

    if (window.location.pathname.includes('/search/')) {
        // The footer is hidden while results keep loading below it.
        const footer = document.getElementById('footer');
        if (footer) {
            footer.style.display = isSettingEnabled('infiniteScroll') && Number.isFinite(nextSearchLoadAllowedAt) ? 'none' : '';
        }
    }

    if (settingsDialog) {
        settingsDialog.querySelectorAll('input[data-setting]').forEach((input) => {
            input.checked = isSettingEnabled(input.dataset.setting);
        });
    }
}

function setSetting(key, enabled) {
    settings = { ...settings, [key]: Boolean(enabled) };
    GM_setValue(SETTINGS_KEY, settings);
    applySettings();
}

function closeSettingsDialog() {
    if (settingsDialog) {
        settingsDialog.remove();
        settingsDialog = null;
    }
}

function openSettingsDialog() {
    if (settingsDialog) {
        closeSettingsDialog();
        return;
    }

    settingsDialog = document.createElement('div');
    settingsDialog.id = 'desux-settings';
    settingsDialog.addEventListener('click', (event) => {
        if (event.target === settingsDialog) {
            closeSettingsDialog();
        }
    });

    const panel = document.createElement('div');
    panel.className = 'desux-settings-panel';

    const header = document.createElement('div');
    header.className = 'desux-settings-header';
    const title = document.createElement('span');
    title.textContent = 'DesuX settings';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.title = 'Close (Esc)';
    closeButton.addEventListener('click', closeSettingsDialog);
    header.append(title, closeButton);
    panel.appendChild(header);

    SETTING_DEFINITIONS.forEach((definition) => {
        const row = document.createElement('label');
        row.className = 'desux-settings-row';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.setting = definition.key;
        input.checked = isSettingEnabled(definition.key);
        input.addEventListener('change', () => setSetting(definition.key, input.checked));

        const text = document.createElement('span');
        const name = document.createElement('strong');
        name.textContent = definition.label;
        const hint = document.createElement('small');
        hint.textContent = definition.hint;
        text.append(name, hint);

        row.append(input, text);
        panel.appendChild(row);
    });

    const note = document.createElement('div');
    note.className = 'desux-settings-note';
    note.textContent = 'Changes apply at once, in every open desuarchive.org tab.';
    panel.appendChild(note);

    settingsDialog.appendChild(panel);
    document.body.appendChild(settingsDialog);
}

function initializeSettings() {
    // Another tab changed a setting.
    GM_addValueChangeListener(SETTINGS_KEY, () => {
        settings = readSettings();
        applySettings();
    });

    GM_registerMenuCommand('DesuX settings', openSettingsDialog);

    const navigation = Array.from(document.querySelectorAll('.navbar ul.nav:not(.pull-right)')).pop();
    if (navigation) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.id = 'desux-settings-link';
        link.textContent = 'DesuX';
        link.title = 'DesuX settings';
        link.addEventListener('click', (event) => {
            event.preventDefault();
            openSettingsDialog();
        });
        item.appendChild(link);
        navigation.appendChild(item);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsDialog) {
            closeSettingsDialog();
        }
    });
}
