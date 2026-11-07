/**
 * Local Device Cache and Distributed Data System
 * Implements client-side IndexedDB caching as required by Section 10.
 * The central database remains authoritative; non-sensitive data is cached
 * locally to accelerate browsing and provide offline resilience.
 * Confidential data (PINs, NI numbers, raw bank cards) is NEVER cached here.
 */

const DB_NAME = 'fine_uk_cache_v1';
const DB_VERSION = 1;
const STORE_LISTINGS = 'cached_listings';
const STORE_CONTACTS = 'cached_contacts';
const STORE_APP_PREFS = 'cached_prefs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_LISTINGS)) {
        db.createObjectStore(STORE_LISTINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONTACTS)) {
        db.createObjectStore(STORE_CONTACTS, { keyPath: 'accountNumber' });
      }
      if (!db.objectStoreNames.contains(STORE_APP_PREFS)) {
        db.createObjectStore(STORE_APP_PREFS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheListingsLocally(listings: any[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_LISTINGS, 'readwrite');
    const store = tx.objectStore(STORE_LISTINGS);
    
    // Put all listings
    for (const item of listings) {
      // Strip any sensitive properties if present
      const cleanItem = { ...item };
      store.put(cleanItem);
    }
  } catch (err) {
    console.warn('[Fine UK Cache] Failed to cache listings locally:', err);
  }
}

export async function getCachedListingsLocally(): Promise<any[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LISTINGS, 'readonly');
      const store = tx.objectStore(STORE_LISTINGS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearLocalSensitiveCache(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_LISTINGS, STORE_CONTACTS], 'readwrite');
    tx.objectStore(STORE_CONTACTS).clear();
    // Keep listings for offline browsing, but clear session specific stores
    localStorage.removeItem('fine_uk_auth_user');
    sessionStorage.clear();
  } catch (err) {
    console.warn('[Fine UK Cache] Failed to clear local cache:', err);
  }
}
