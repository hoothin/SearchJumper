const clone = value => JSON.parse(JSON.stringify(value));
let base;
let queue = Promise.resolve();
let serial = 0;
let saveFailed = false;
const pending = new Map();

window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== window.location.origin || event.data?.command !== 'configResponse') return;
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    clearTimeout(request.timeout);
    if (event.data.ok) request.resolve(event.data.value);
    else request.reject(new Error(event.data.error || 'Configuration request failed'));
});

export function setConfig(value) {
    const data = clone(value);
    if (data.webdavConfig) delete data.webdavConfig.password;
    window.searchData = data;
    base = clone(data);
    return data;
}

export function configRequest(operation, detail) {
    const result = queue.then(() => {
        if (operation === 'save') detail = {...detail, base};
        if (operation === 'sync' && detail?.uploadOnly && saveFailed) throw new Error('Save settings successfully before retrying sync');
        if (/^(chrome|moz)-extension:$/.test(window.location.protocol)) {
            return (window.browser || window.chrome).runtime.sendMessage({action: 'configRequest', operation, detail}).then(response => {
                if (!response?.ok) throw new Error(response?.error || 'Configuration request failed');
                return response.value;
            });
        }
        return new Promise((resolve, reject) => {
            const id = String(++serial);
            const timeout = setTimeout(() => {
                pending.delete(id);
                reject(new Error('Configuration request timed out'));
            }, 180000);
            pending.set(id, {resolve, reject, timeout});
            document.dispatchEvent(new CustomEvent('configRequest', {detail: {id, operation, detail}}));
        });
    });
    const completed = result.then(value => {
        if (operation === 'save') {
            base = clone(detail.searchData);
            saveFailed = false;
        }
        return value;
    }, error => {
        if (operation === 'save') saveFailed = true;
        throw error;
    });
    queue = completed.catch(() => {});
    return completed;
}

export function reportConfigError(error) {
    document.dispatchEvent(new CustomEvent('configError', {detail: String(error.message || error)}));
}

document.addEventListener('saveConfig', event => {
    const detail = event.detail || event;
    const searchData = clone(detail.searchData || window.searchData);
    configRequest('save', {searchData}).then(data => {
        // A completed older save must not replace edits made while it was pending.
        if (JSON.stringify(window.searchData) === JSON.stringify(searchData)) setConfig(data);
        document.dispatchEvent(new CustomEvent('configSaved', {detail: {notification: !!detail.notification}}));
    }).catch(reportConfigError);
});

window.saveToWebdav = () => configRequest('sync', {uploadOnly: true}).catch(reportConfigError);

export function backupConfig(value) {
    const data = clone(value);
    if (data.webdavConfig) {
        delete data.webdavConfig.password;
        delete data.webdavConfig.hasPassword;
    }
    return data;
}
