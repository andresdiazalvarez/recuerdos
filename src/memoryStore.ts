import { useEffect, useState } from 'react';

export type Dish = { id: string; name: string; tags: string; image: string; x: number; y: number };
export type Memory = { id: string; date: string; place: string; coords: [number, number]; image: string; dishes: Dish[] };
export type Seed = { place: string; coords: [number, number] };
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
export const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
export type Filters = { query: string; place: string; exact: string; from: string; to: string };
export function matchesMemory(m: Memory, filters: Filters, dish?: Dish) {
  return (!filters.exact || m.date === filters.exact) && (!filters.from || m.date >= filters.from) && (!filters.to || m.date <= filters.to) &&
    normalize(m.place).includes(normalize(filters.place)) && normalize(dish ? `${dish.name} ${dish.tags}` :
      `${m.place} ${m.date} ${formatDate(m.date)} ${m.dishes.map(d => `${d.name} ${d.tags}`).join(' ')}`).includes(normalize(filters.query));
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('recuerdos-personales', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('memories', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Cierra otras pestañas de Recuerdos e inténtalo de nuevo.'));
  });
}
async function readAll(): Promise<Memory[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('memories', 'readonly');
    const req = tx.objectStore('memories').getAll();
    tx.oncomplete = () => { db.close(); resolve(req.result as Memory[]); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
async function writeAll(records: Memory[]) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('memories', 'readwrite');
    records.forEach(record => tx.objectStore('memories').put(record));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export function useMemoryStore() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    readAll().then(records => { if (active) { setMemories(records); setReady(true); } }).catch(() => {
      if (active) setError('No se puede acceder a tus recuerdos guardados. Comprueba que el navegador permita el almacenamiento y vuelve a cargar.');
    });
    return () => { active = false; };
  }, []);
  const save = async (records: Memory[]) => {
    if (!ready) throw new Error('El almacenamiento todavía no está disponible.');
    try { await writeAll(records); }
    catch { throw new Error('No se pudo guardar. Comprueba el espacio disponible del dispositivo. Tu recuerdo aún no se ha guardado.'); }
    setMemories(current => {
      const updated = new Map(current.map(record => [record.id, record]));
      records.forEach(record => updated.set(record.id, record));
      return [...updated.values()];
    });
  };
  return { memories, ready, error, save };
}

export async function readImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Elige una imagen JPG, PNG o WebP. Convierte las fotos HEIC a JPG antes de añadirlas.');
  if (file.size > 25 * 1024 * 1024) throw new Error('La foto supera 25 MB. Reduce su tamaño antes de añadirla.');
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
  await new Promise<void>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(new Error('Esta imagen no se puede visualizar. Elige otra foto.')); img.src = data;
  });
  return data;
}
const imagePattern = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export function validateBackup(value: unknown): Memory[] {
  const root = value as { version?: number; memories?: unknown[] } | null;
  if (!root || root.version !== 1 || !Array.isArray(root.memories)) throw new Error('El archivo no es una copia de seguridad de Recuerdos.');
  const ids = new Set<string>();
  for (const entry of root.memories) {
    const m = entry as Memory | null;
    if (!m || typeof m.id !== 'string' || !m.id || ids.has(m.id) || typeof m.place !== 'string' || !m.place.trim() ||
      typeof m.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(m.date) || !Number.isFinite(Date.parse(m.date)) || new Date(m.date).toISOString().slice(0,10) !== m.date ||
      !Array.isArray(m.coords) || m.coords.length !== 2 || !m.coords.every(Number.isFinite) || Math.abs(m.coords[0]) > 180 || Math.abs(m.coords[1]) > 85 ||
      typeof m.image !== 'string' || !imagePattern.test(m.image) || !Array.isArray(m.dishes)) throw new Error('La copia contiene un recuerdo no válido. No se ha importado nada.');
    ids.add(m.id);
    const dishes = new Set<string>();
    for (const d of m.dishes) {
      if (!d || typeof d.id !== 'string' || !d.id || dishes.has(d.id) || typeof d.name !== 'string' || !d.name.trim() || typeof d.tags !== 'string' ||
        typeof d.image !== 'string' || !imagePattern.test(d.image) || !Number.isFinite(d.x) || !Number.isFinite(d.y) || d.x < 0 || d.x > 1 || d.y < 0 || d.y > 1) throw new Error('La copia contiene un plato no válido. No se ha importado nada.');
      dishes.add(d.id);
    }
  }
  return root.memories as Memory[];
}
