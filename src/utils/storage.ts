export interface badge {
  text?: string;
  type?: string;
}

export interface Marks {
  [id: number]: badge;
}

const getStorage = () => {
  // Hack for firefox, apparently it doesn't work with sync storage correctly
  // @ts-ignore
  const isFirefox = typeof window["InstallTrigger"] !== "undefined";
  return isFirefox ? chrome.storage.local : chrome.storage.sync;
};

export const saveToStorage = (data: Marks) => getStorage().set(data);

export const getFromStorage = (query: string) => {
  return new Promise<Marks>((resolve) => getStorage().get(query, resolve));
};

export const getAllFromStorage = () => {
  return new Promise<Marks>((resolve) => getStorage().get(null, resolve));
};

export const removeFromStorage = (query: string) => getStorage().remove(query);
