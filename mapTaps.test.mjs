import test from 'node:test';
import assert from 'node:assert/strict';
import { createMapTaps } from '../src/mapTaps.ts';
import { DOUBLE_MS } from '../src/model.ts';

function setup() {
  const pending = new Map(); const events = []; let sequence = 0;
  const taps = createMapTaps(value=>events.push(['zoom',value]),value=>events.push(['create',value]),{
    later:(fn,delay)=>{assert.equal(delay,DOUBLE_MS);const id=++sequence;pending.set(id,fn);return id;},
    cancel:id=>pending.delete(id),
  });
  const flush=()=>{const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn());};
  return { taps, events, flush, pending };
}
test('un toque espera y después acerca sin crear un punto',()=>{
  const s=setup();s.taps.tap({x:100,y:100,time:0},'a');assert.deepEqual(s.events,[]);s.flush();assert.deepEqual(s.events,[['zoom','a']]);
});
test('dos toques cercanos crean un único punto y cancelan el zoom',()=>{
  const s=setup();s.taps.tap({x:100,y:100,time:100},'primero');s.taps.tap({x:108,y:106,time:280},'punto-exacto');s.flush();
  assert.deepEqual(s.events,[['create','punto-exacto']]);assert.equal(s.pending.size,0);
});
test('tolera la pequeña imprecisión del dedo al dar dos toques',()=>{
  const s=setup();s.taps.tap({x:100,y:100,time:100},'a');s.taps.tap({x:125,y:115,time:100+DOUBLE_MS},'b');s.flush();assert.deepEqual(s.events,[['create','b']]);
});
test('dos toques separados en distancia o tiempo no crean un marcador',()=>{
  for(const second of [{x:180,y:100,time:200},{x:100,y:100,time:DOUBLE_MS+101}]){
    const s=setup();s.taps.tap({x:100,y:100,time:100},'a');s.taps.tap(second,'b');s.flush();assert.deepEqual(s.events,[['zoom','b']]);
  }
});
test('arrastrar, cancelar o pellizcar elimina el toque pendiente',()=>{
  const s=setup();s.taps.tap({x:100,y:100,time:100},'a');s.taps.cancel();s.flush();assert.deepEqual(s.events,[]);
  s.taps.tap({x:100,y:100,time:200},'b');s.flush();assert.deepEqual(s.events,[['zoom','b']]);
});
