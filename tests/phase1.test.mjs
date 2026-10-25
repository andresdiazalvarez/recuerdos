import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { appendPanorama, appendPhoto, EMPTY, PHOTO_SIZE, pointRows, validDate, wrap, WORLD } from '../src/model.ts';
import { loadLibrary, persist, readPicture } from '../src/storage.ts';

const point=(id,name='Playa',date='2026-10-25')=>({id,name,date,coords:[-6,36],view:WORLD});
const pano=(id,pointId)=>({id,pointId,backgrounds:[`fondo-${id}`],direction:0,created:1});
test('dos puntos y dos panorámicas independientes sin sustitución',()=>{
  const start={...structuredClone(EMPTY),points:[point('p1'),point('p2')]};
  const first=appendPanorama(start,pano('a','p1'));
  const second=appendPanorama(first,pano('b','p2'));
  const third=appendPanorama(second,pano('c','p1'));
  assert.equal(start.panoramas.length,0);assert.equal(first.panoramas.length,1);
  assert.deepEqual(third.panoramas.map(p=>[p.id,p.pointId]),[['a','p1'],['b','p2'],['c','p1']]);
  assert.throws(()=>appendPanorama(third,pano('a','p1')));
  assert.throws(()=>appendPanorama(third,pano('d','no-existe')));
});
test('añadir fotos conserva las anteriores y las vincula a su panorámica',()=>{
  const base={...structuredClone(EMPTY),points:[point('p1'),point('p2')],panoramas:[pano('a','p1'),pano('b','p2')]};
  const photo={id:'foto1',panoramaId:'a',imageId:'img1',date:'2026-10-25',text:'Paseo',direction:.7,y:.4,size:PHOTO_SIZE};
  const result=appendPhoto(appendPhoto(base,photo),{...photo,id:'foto2',panoramaId:'b',imageId:'img2'});
  assert.deepEqual(result.photos.map(p=>p.panoramaId),['a','b']);assert.equal(base.photos.length,0);
  assert.throws(()=>appendPhoto(result,photo));assert.throws(()=>appendPhoto(result,{...photo,id:'nuevo',panoramaId:'ausente'}));
});
test('LUGAR y FECHA conservan todas las combinaciones reales',()=>{
  const library={...structuredClone(EMPTY),points:[point('a','Cádiz','2026-10-25'),point('b','Cádiz','2026-10-24'),point('c','Conil','2026-10-25'),point('d','Cádiz','2026-10-25')]};
  assert.equal(pointRows(library).length,4);
  assert.equal(pointRows(library,'cadiz').length,3);
  assert.equal(pointRows(library,'','2026-10-25',true).length,3);
  assert.deepEqual(pointRows(library,'cadiz','2026-10-24').map(p=>p.id),['b']);
  assert.equal(pointRows(library,'','',true).at(-1).date,'2026-10-24');
});
test('fechas válidas y dirección circular al cruzar el último fondo',()=>{
  assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2024-02-29'),true);assert.equal(validDate(''),false);
  assert.equal(wrap(3.25,3),.25);assert.equal(wrap(-.5,3),2.5);
  assert.ok(Math.abs(PHOTO_SIZE*390-48*1.3)<1e-9);
});
test('IndexedDB conserva puntos, panorámicas e imágenes tras volver a leer; abortar no sobrescribe datos',async()=>{
  const empty=await loadLibrary();assert.equal(empty.points.length,0);
  const image={id:'img1',original:new Blob(['original']),medium:new Blob(['media']),thumbnail:new Blob(['miniatura']),width:100,height:50};
  const first={...structuredClone(EMPTY),points:[point('p1')],panoramas:[pano('a','p1')]};
  await persist(first,[image]);assert.deepEqual(await loadLibrary(),first);
  const second={...first,points:[...first.points,point('p2')],panoramas:[...first.panoramas,pano('b','p2')]};
  await persist(second);assert.deepEqual(await loadLibrary(),second);
  assert.equal(await (await readPicture('img1')).original.text(),'original');
  await assert.rejects(persist({...second,points:[]},[image]));
  assert.deepEqual(await loadLibrary(),second);
  await assert.rejects(readPicture('no-existe'));
});
