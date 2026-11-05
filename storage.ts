import { EMPTY, PHOTO_SIZE, id, type Library, type Picture } from './model.ts';

let connection: Promise<IDBDatabase> | undefined;
function db() {
  if (!connection) connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('recuerdos-personales', 2);
    request.onupgradeneeded = () => {
      for (const name of ['state', 'images']) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' });
    };
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); connection = undefined; }; resolve(request.result); };
    request.onerror = () => { connection = undefined; reject(request.error); };
    request.onblocked = () => { connection = undefined; reject(new Error('Cierra otras pestañas de Recuerdos y vuelve a cargar.')); };
  });
  return connection;
}
export async function readPicture(imageId: string): Promise<Picture> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('images'); const req = tx.objectStore('images').get(imageId);
    req.onsuccess = () => req.result ? resolve(req.result) : reject(new Error('No se encuentra esta imagen en el dispositivo.'));
    req.onerror = () => reject(req.error);
  });
}
export async function persist(library: Library, pictures: Picture[] = []) {
  const database = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(['state', 'images'], 'readwrite');
    tx.objectStore('state').put({ id: 'library', value: library });
    for (const picture of pictures) tx.objectStore('images').add(picture);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(new Error('No se ha podido guardar. Comprueba el espacio del dispositivo; tus recuerdos anteriores se conservan.'));
  });
}
export async function loadLibrary(): Promise<Library> {
  const database = await db();
  const state = await new Promise<Library | undefined>((resolve, reject) => {
    const req = database.transaction('state').objectStore('state').get('library');
    req.onsuccess = () => resolve(req.result?.value); req.onerror = () => reject(req.error);
  });
  if (state) return state;
  // Import the old prototype once. The original store remains untouched.
  const library: Library = structuredClone(EMPTY);
  const pictures: Picture[] = [];
  if (database.objectStoreNames.contains('memories')) {
    const old = await new Promise<Array<{ id: string; place: string; date: string; coords: [number, number]; image: string; dishes: Array<{ name: string; tags: string; image: string; x: number; y: number }> }>>((resolve, reject) => {
      const req = database.transaction('memories').objectStore('memories').getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
    for (const memory of old) {
      const background = await prepareImage(await dataFile(memory.image)); pictures.push(background);
      const panoId = id();
      library.points.push({ id: memory.id, name: memory.place, date: memory.date, coords: memory.coords, view: { center: memory.coords, zoom: 14, bearing: 0, pitch: 0 } });
      library.panoramas.push({ id: panoId, pointId: memory.id, backgrounds: [background.id], direction: 0, created: Date.now() });
      for (const dish of memory.dishes) {
        const photo = await prepareImage(await dataFile(dish.image)); pictures.push(photo);
        library.photos.push({ id: id(), panoramaId: panoId, imageId: photo.id, date: memory.date, text: `${dish.name}${dish.tags ? ` · ${dish.tags}` : ''}`, direction: dish.x, y: dish.y, size: PHOTO_SIZE });
      }
    }
  }
  await persist(library, pictures);
  return library;
}
async function dataFile(data: string) { const blob = await (await fetch(data)).blob(); return new File([blob], 'recuerdo.jpg', { type: blob.type }); }

export async function prepareImage(file: File): Promise<Picture> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Selecciona fotos JPG, PNG o WebP. Convierte HEIC a JPG antes de añadirlo.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Cada fotografía debe ocupar menos de 25 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('No se puede leer esta fotografía.')); image.src = url; });
    const resize = async (max: number) => {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const context = canvas.getContext('2d'); if (!context) throw new Error('No se puede procesar la imagen.');
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo preparar la foto.')), 'image/jpeg', .86));
    };
    return { id: id(), original: file, medium: await resize(1920), thumbnail: await resize(320), width: img.naturalWidth, height: img.naturalHeight };
  } finally { URL.revokeObjectURL(url); }
}
