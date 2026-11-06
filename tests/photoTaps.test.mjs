import test from 'node:test';
import assert from 'node:assert/strict';
import {createPhotoTaps} from '../src/photoTaps.ts';
import {changePhotoSize,PHOTO_SIZE} from '../src/model.ts';
function fixture(){let next=0;const jobs=new Map(),events=[];const taps=createPhotoTaps(()=>events.push('open'),()=>events.push('grow'),()=>events.push('shrink'),420,fn=>{jobs.set(++next,fn);return next;},id=>jobs.delete(id));return{taps,events,flush:()=>{for(const fn of [...jobs.values()])fn();}};}
test('doble toque amplía y triple solo reduce, sin apertura ni ampliación intermedia',()=>{
 let f=fixture();f.taps.tap();f.taps.tap();assert.deepEqual(f.events,[]);f.flush();assert.deepEqual(f.events,['grow']);
 f=fixture();f.taps.tap();f.taps.tap();f.taps.tap();f.flush();assert.deepEqual(f.events,['shrink']);
 f=fixture();f.taps.tap();f.flush();assert.deepEqual(f.events,['open']);
});
test('arrastre y pulsación larga cancelan la secuencia pendiente',()=>{const f=fixture();f.taps.tap();f.taps.pause();f.flush();assert.deepEqual(f.events,[]);f.taps.cancel();f.taps.tap();f.flush();assert.deepEqual(f.events,['open']);});
test('reducir recupera exactamente los tamaños anteriores y volver a ampliar funciona',()=>{
 const original={size:PHOTO_SIZE};const first=changePhotoSize(original,true),second=changePhotoSize(first,true),reduced=changePhotoSize(second,false);
 assert.equal(reduced.size,first.size);assert.equal(changePhotoSize(reduced,true).size,second.size);assert.equal(changePhotoSize(changePhotoSize(reduced,false),false).size,PHOTO_SIZE);
});

test('las fotos ampliadas en versiones anteriores también se reducen',()=>{assert.equal(changePhotoSize({size:PHOTO_SIZE*1.5},false).size,PHOTO_SIZE);});
