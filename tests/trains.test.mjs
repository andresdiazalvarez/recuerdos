import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {EMPTY,saveTrain,removeTrain,appendTrainPhoto,reversePanorama} from '../src/model.ts';
import {persist,loadLibrary} from '../src/storage.ts';
const photo=(id,panoramaId)=>({id,panoramaId,imageId:id,date:'2026-11-05',text:id,direction:.2,y:.5,size:.16});
const base=()=>({...structuredClone(EMPTY),panoramas:[{id:'a',pointId:'p',backgrounds:['one','two','three'],direction:0,created:1},{id:'b',pointId:'q',backgrounds:['other'],direction:0,created:2}],photos:[photo('1','a'),photo('2','a'),photo('3','b')]});
const group=(id,direction,photoIds)=>({id,name:id,direction,photoIds});
test('varios trenes independientes conservan fotos sueltas y datos antiguos',()=>{
 const original=base(),first=saveTrain(original,'a',group('playa',.5,['1'])),second=saveTrain(first,'a',group('restaurante',2.5,['2']));
 assert.equal(original.panoramas[0].trains,undefined);
 assert.deepEqual(second.panoramas[0].trains.map(t=>t.photoIds),[['1'],['2']]);
 assert.deepEqual(second.photos,original.photos);assert.equal(second.panoramas[1],original.panoramas[1]);
 assert.throws(()=>saveTrain(second,'a',group('ajeno',0,['3'])),/pertenecer/);
});
test('añadir una foto al tren no modifica otros trenes y admite fotos sin tren',()=>{
 const one=saveTrain(base(),'a',group('playa',.5,['1']));
 const next=appendTrainPhoto(one,photo('nueva','a'),'playa');
 assert.deepEqual(next.panoramas[0].trains[0].photoIds,['1','nueva']);
 const loose=appendTrainPhoto(next,photo('suelta','a'));
 assert.equal(loose.photos.length,5);assert.deepEqual(loose.panoramas,next.panoramas);
 assert.throws(()=>appendTrainPhoto(next,photo('error','a'),'ausente'),/tren/);
});
test('editar y quitar un tren conserva todas sus fotos',()=>{
 let current=saveTrain(base(),'a',group('playa',.5,['1']));current=saveTrain(current,'a',group('playa',.5,['2']));
 assert.equal(current.panoramas[0].trains.length,1);assert.deepEqual(current.panoramas[0].trains[0].photoIds,['2']);
 const removed=removeTrain(current,'a','playa');assert.equal(removed.panoramas[0].trains.length,0);assert.deepEqual(removed.photos,current.photos);
});
test('trenes y posiciones sobreviven recarga e inversión de fondos',async()=>{
 const current=saveTrain(saveTrain(base(),'a',group('playa',.5,['1'])),'a',group('restaurante',2.5,['2']));
 await persist(current);assert.deepEqual(await loadLibrary(),current);
 const reversed=reversePanorama(current,'a');assert.deepEqual(reversed.panoramas[0].trains.map(t=>t.direction),[2.5,.5]);
 const restored=reversePanorama(reversed,'a');assert.deepEqual(restored.panoramas,current.panoramas);restored.photos.forEach((p,i)=>assert.ok(Math.abs(p.direction-current.photos[i].direction)<1e-12));
});
