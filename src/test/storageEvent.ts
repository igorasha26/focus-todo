
export function changeStorageInOtherTab(key: string | null, value: string | null): void {
  if (key === null) {
    localStorage.clear();
  } else if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: value, storageArea: localStorage }));
}
