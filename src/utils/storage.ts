export interface Badge {
    text?: string
    type?: string
}

export type StorageArg = {
    [id: string]: Badge
}

const getStorage = () => {
    // Hack for firefox, apparently it doesn't work with sync storage correctly
    const isFirefox = ("InstallTrigger" in window) && typeof window.InstallTrigger !== 'undefined';
    return isFirefox ? chrome.storage.local : chrome.storage.sync;
}

export const saveToStorage = (data: StorageArg) => {
    return getStorage().set(data)
}

export const getFromStorage = (query: string) => {
    return new Promise<StorageArg>(resolve => getStorage().get(query, resolve))
}

export const getAllFromStorage = () => {
    return new Promise<StorageArg>(resolve => getStorage().get(null, resolve))
}

export const removeFromStorage = (query: string) => {
    return getStorage().remove(query)
}
