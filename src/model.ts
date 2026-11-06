export type View = { center: [number, number]; zoom: number; bearing: number; pitch: number };
export type Zone = { id: string; name: string; view: View; country?: string; province?: string; municipality?: string };
export type MemoryPoint = { id: string; zoneId?: string; coords: [number, number]; date: string; name: string; view: View; country?: string; province?: string; municipality?: string };
export type Panorama = { id: string; pointId: string; backgrounds: string[]; direction: number; created: number };
export type PlacedPhoto = { id: string; panoramaId: string; imageId: string; secondImageId?: string; date: string; text: string; direction: number; y: number; size: number; isDish?: boolean; dishName?: string; previousSizes?: number[] };
export type Picture = { id: string; original: Blob; medium: Blob; thumbnail: Blob; width: number; height: number };
export type Library = { zones: Zone[]; points: MemoryPoint[]; panoramas: Panorama[]; photos: PlacedPhoto[] };
export const WORLD: View = { center: [-5, 37], zoom: 1.6, bearing: 0, pitch: 0 };
export const EMPTY: Library = { zones: [], points: [], panoramas: [], photos: [] };
export const PHOTO_SIZE = 48 * 1.3 / 390;
export const DOUBLE_MS = 420;
export const HOLD_MS = 650;
export const id = () => crypto.randomUUID();
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
export const dateText = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('es-ES');
export const wrap = (x: number, length = 1) => ((x % length) + length) % length;
export const delta = (a: number, b: number, length: number) => wrap(a - b + length / 2, length) - length / 2;
export function validDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s; }
export function appendPanorama(library: Library, pano: Panorama): Library {
  if (!library.points.some(p => p.id === pano.pointId)) throw new Error('El punto de recuerdo no existe.');
  if (library.panoramas.some(p => p.id === pano.id)) throw new Error('La panorámica ya existe.');
  return { ...library, panoramas: [...library.panoramas, pano] };
}
export function appendPhoto(library: Library, photo: PlacedPhoto): Library {
  if (!library.panoramas.some(p => p.id === photo.panoramaId)) throw new Error('La panorámica no existe.');
  if (library.photos.some(p => p.id === photo.id)) throw new Error('La fotografía ya existe.');
  return { ...library, photos: [...library.photos, photo] };
}
export function pointRows(library: Library, query = '', date = '', byDate = false) {
  return library.points.filter(p => (!date || p.date === date) && normalize(p.name).includes(normalize(query)))
    .sort((a, b) => byDate ? b.date.localeCompare(a.date) || a.name.localeCompare(b.name, 'es') : a.name.localeCompare(b.name, 'es') || b.date.localeCompare(a.date));
}

export function reversePanorama(library: Library, panoramaId: string): Library {
  const panorama=library.panoramas.find(p=>p.id===panoramaId);
  if(!panorama)throw new Error('La panorámica no existe.');
  const count=panorama.backgrounds.length;
  if(count<2)return library;
  return {...library,
    panoramas:library.panoramas.map(p=>p.id===panoramaId?{...p,backgrounds:[...p.backgrounds].reverse(),direction:0}:p),
    // Move each attached photo with its original background, without mirroring it.
    photos:library.photos.map(photo=>{
      if(photo.panoramaId!==panoramaId)return photo;
      const original=wrap(photo.direction,count),panel=Math.floor(original);
      return {...photo,direction:count-1-panel+(original-panel)};
    })};
}


export function changePhotoSize(photo:PlacedPhoto,grow:boolean):PlacedPhoto{
 const history=photo.previousSizes||[];
 if(grow){const size=Math.min(.5,photo.size*1.5);return size===photo.size?photo:{...photo,size,previousSizes:[...history,photo.size]};}
 if(!history.length)return photo.size>PHOTO_SIZE?{...photo,size:Math.max(PHOTO_SIZE,photo.size/1.5)}:photo;
 return {...photo,size:history[history.length-1],previousSizes:history.slice(0,-1)};
}

export function dishRows(library:Library,query='',date='',place=''){
 return library.photos.flatMap(photo=>{
  if(!photo.isDish||!normalize(photo.dishName||'').includes(normalize(query))||(date&&photo.date!==date))return [];
  const panorama=library.panoramas.find(p=>p.id===photo.panoramaId),point=library.points.find(p=>p.id===panorama?.pointId);
  if(!panorama||!point||!normalize(point.name).includes(normalize(place)))return [];
  return [{photo,panorama,point}];
 }).sort((a,b)=>(a.photo.dishName||'').localeCompare(b.photo.dishName||'','es')||b.photo.date.localeCompare(a.photo.date));
}
