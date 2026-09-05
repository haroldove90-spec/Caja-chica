/**
 * Gestor de Almacenamiento Seguro (Safe Storage Manager)
 * 
 * Previene caídas críticas por "QuotaExceededError" en navegadores.
 * Proporciona:
 * 1. safeLocalStorageGet / safeLocalStorageSet con manejo de cuota y tolerancia a fallos.
 * 2. Limpieza y desinfección automática de datos masivos (base64) para el caché de localStorage.
 * 3. Almacén persistente en IndexedDB para soportar imágenes grandes sin restricciones de cuota (5MB de localStorage).
 */

const DB_NAME = 'caja_chica_offline_db';
const STORE_NAME = 'app_cache';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getIndexedDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no soportado en este entorno'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Error al abrir IndexedDB'));
      };
    } catch (e) {
      reject(e);
    }
  });

  return dbPromise;
}

/**
 * Guarda cualquier objeto o arreglo en IndexedDB (sin límite de 5MB).
 */
export async function saveToIndexedDb(key: string, value: any): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn(`IndexedDB put notice para [${key}]:`, req.error);
        resolve(false);
      };
    });
  } catch (e) {
    // IndexedDB puede estar deshabilitado en navegación privada estricta
    return false;
  }
}

/**
 * Carga un registro desde IndexedDB.
 */
export async function loadFromIndexedDb<T>(key: string): Promise<T | null> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    return null;
  }
}

/**
 * Limpia data URIs excesivamente grandes (> 4KB) en un clon del objeto para el almacenamiento en localStorage.
 * Las imágenes completas se conservan en la memoria RAM y en IndexedDB.
 */
export function sanitizeForLocalStorage(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    if (data.startsWith('data:') && data.length > 4096) {
      // Dejar una referencia compacta para que no desborde la cuota de 5MB
      return '[IMAGEN_EN_CACHE_INDEXEDDB]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLocalStorage(item));
  }

  if (typeof data === 'object') {
    const copy: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      copy[k] = sanitizeForLocalStorage(v);
    }
    return copy;
  }

  return data;
}

/**
 * Lee de forma segura un valor desde localStorage con fallback.
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`safeLocalStorageGet: Error leyendo clave [${key}], usando fallback:`, err);
    return fallback;
  }
}

/**
 * Intenta liberar espacio eliminando claves antiguas o no críticas si la cuota está saturada.
 */
export function cleanStorageQuota(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToCheck: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) keysToCheck.push(k);
    }

    // Identificar claves temporales o viejas
    for (const k of keysToCheck) {
      if (k.includes('_temp_') || k.includes('vite') || k.includes('debug')) {
        window.localStorage.removeItem(k);
      }
    }
  } catch (e) {
    // Ignorar si falla
  }
}

/**
 * Guarda en localStorage de forma tolerante a fallos:
 * 1. Intenta guardar el valor original.
 * 2. Si falla por cuota (QuotaExceededError):
 *    - Limpia claves temporales.
 *    - Reemplaza strings base64 pesados por tokens de referencia en la copia de localStorage.
 *    - Intenta guardar de nuevo.
 * 3. Si aún así la cuota no alcanza, limita el array a los últimos 30 registros.
 * 4. NUNCA propaga la excepción hacia React; previene caídas y ErrorBoundary.
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (firstErr: any) {
    const isQuota =
      firstErr?.name === 'QuotaExceededError' ||
      firstErr?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      firstErr?.code === 22 ||
      firstErr?.code === 1014 ||
      String(firstErr).toLowerCase().includes('quota');

    if (!isQuota) {
      console.warn(`Error al guardar [${key}] en localStorage:`, firstErr);
      return false;
    }

    // Cuota excedida: ejecutar rescate y optimización
    try {
      cleanStorageQuota();

      // Estrategia 1: Sanear imágenes base64 en la copia de almacenamiento local
      const sanitized = sanitizeForLocalStorage(value);
      window.localStorage.setItem(key, JSON.stringify(sanitized));
      return true;
    } catch (secondErr: any) {
      // Estrategia 2: Si es un arreglo largo, guardar solo los elementos más recientes en el caché local
      try {
        if (Array.isArray(value) && value.length > 25) {
          const trimmed = sanitizeForLocalStorage(value.slice(-25));
          window.localStorage.setItem(key, JSON.stringify(trimmed));
          return true;
        }
      } catch (thirdErr) {
        // Ignorar
      }

      console.warn(
        `Aviso: La cuota de LocalStorage del navegador se encuentra al límite para [${key}]. ` +
        `Los datos completos permanecen seguros en memoria e IndexedDB.`
      );
      return false;
    }
  }
}
