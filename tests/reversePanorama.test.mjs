import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {reversePanorama,EMPTY,PHOTO_SIZE} from '../src/model.ts';
import {persist,loadLibrary} from '../src/storage.ts';
const photo=(id,panoramaId,direction)=>({id,panoramaId,direction,imageId:'foto',date:'2026-11-05',text:'Recuerdo',y:.4,size:PHOTO_SIZE});
const library=()=>({...structuredClone(EMPTY),panoramas:[{id:'a',pointId:'p',backgrounds:['primero','segundo','tercero'],direction:0,created:1},{id:'b',pointId:'q',backgrounds:['otro'],direction:0,created:2}],photos:[photo('uno','a',.25),photo('dos','a',1.5),photo('tres','a',2.75),photo('ajena','b',.5)]});
test('invierte fondos, conserva originales y mueve fotos junto a su fondo',()=>{
 const original=library(),next=reversePanorama(original,'a');
 assert.deepEqual(next.panoramas[0].backgrounds,['tercero','segundo','primero']);
 assert.deepEqual(original.panoramas[0].backgrounds,['primero','segundo','tercero']);
 assert.deepEqual(next.photos.map(p=>p.direction),[2.25,1.5,.75,.5]);
 assert.equal(next.panoramas[1],original.panoramas[1]);assert.equal(next.photos[3],original.photos[3]);
 assert.deepEqual(reversePanorama(next,'a'),original);
});
test('la inversión queda guardada al volver a cargar',async()=>{
 const next=reversePanorama(library(),'a');await persist(next);
 assert.deepEqual(await loadLibrary(),next);
});
test('una panorámica con un único fondo no cambia',()=>{
 const original=library();assert.equal(reversePanorama(original,'b'),original);
 assert.throws(()=>reversePanorama(original,'ausente'),/no existe/);
});
