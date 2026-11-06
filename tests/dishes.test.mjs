import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {dishRows,EMPTY,WORLD} from '../src/model.ts';
import {persist,loadLibrary} from '../src/storage.ts';
const library=()=>({...structuredClone(EMPTY),points:[{id:'p',name:'Cádiz',date:'2026-11-06',coords:[-6,36],view:WORLD}],panoramas:[{id:'a',pointId:'p',backgrounds:['fondo'],direction:0,created:1},{id:'b',pointId:'p',backgrounds:['otro'],direction:0,created:2}],photos:[{id:'1',panoramaId:'a',imageId:'i1',isDish:true,dishName:'Atún encebollado',date:'2026-11-06',text:'',direction:.3,y:.4,size:.16},{id:'2',panoramaId:'b',imageId:'i2',isDish:true,dishName:'Atún encebollado',date:'2026-11-05',text:'',direction:.7,y:.4,size:.16},{id:'3',panoramaId:'a',imageId:'i3',date:'2026-11-06',text:'atún',direction:.1,y:.4,size:.16}]});
test('busca platos sin tildes, conserva fechas repetidas y apunta a la panorámica y foto exactas',()=>{
 const rows=dishRows(library(),'atun');assert.equal(rows.length,2);assert.equal(rows[0].photo.id,'1');assert.equal(rows[1].panorama.id,'b');
 assert.equal(dishRows(library(),'atun','2026-11-05','cadiz')[0].photo.id,'2');assert.equal(dishRows(library(),'','', 'Madrid').length,0);
});
test('clasificación y nombre sobreviven a recarga; fotos antiguas no se clasifican solas',async()=>{const data=library();await persist(data);assert.deepEqual(await loadLibrary(),data);assert.equal(dishRows(await loadLibrary()).length,2);data.photos[0].isDish=false;assert.equal(dishRows(data).length,1);});
