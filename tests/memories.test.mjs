import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesMemory, validateBackup, normalize } from '../src/memoryStore.ts';

const image = 'data:image/png;base64,aGVsbG8=';
const dish = { id:'dish-1',name:'Atún a la plancha',tags:'pescado, almuerzo',image,x:.8,y:.35 };
const memory = { id:'memory-1',place:'Los Caños de Meca',date:'2026-04-09',coords:[-5.96,36.18],image,dishes:[dish] };
const filters = { query:'',place:'',exact:'',from:'',to:'' };
test('plato, lugar sin tildes y fecha exacta se combinan',()=>{
  assert.equal(matchesMemory(memory,{...filters,query:'atun',place:'canos',exact:'2026-04-09'},dish),true);
  assert.equal(matchesMemory(memory,{...filters,query:'atun',place:'canos',exact:'2026-04-10'},dish),false);
  assert.equal(matchesMemory(memory,{...filters,query:'arroz'},dish),false);
});
test('etiquetas y límites inclusivos del intervalo de fechas',()=>{
  assert.equal(matchesMemory(memory,{...filters,query:'PESCADO',from:'2026-04-09',to:'2026-04-09'},dish),true);
  assert.equal(matchesMemory(memory,{...filters,from:'2026-04-10'},dish),false);
  assert.equal(matchesMemory(memory,{...filters,to:'2026-04-08'},dish),false);
  assert.equal(matchesMemory(memory,{...filters,from:'2026-04-10',to:'2026-04-08'},dish),false);
});
test('búsqueda de panorámicas por fecha, lugar y plato asociado',()=>{
  for(const query of ['2026-04-09','abril','canos','atun','pescado']) assert.equal(matchesMemory(memory,{...filters,query}),true);
  assert.equal(normalize('  Cádiz '),'cadiz');
});
test('copia válida conserva coordenadas y puntos de platos',()=>{
  assert.deepEqual(validateBackup({version:1,memories:[memory]}),[memory]);
});
test('rechaza copias con fechas imposibles, coordenadas o imágenes externas',()=>{
  for(const change of [{date:'2026-02-30'},{coords:[200,36]},{coords:[-6,NaN]},{image:'https://example.com/image.jpg'},{place:''},{id:''}]) {
    assert.throws(()=>validateBackup({version:1,memories:[{...memory,...change}]}));
  }
});
test('rechaza identificadores duplicados y puntos fuera de la panorámica',()=>{
  assert.throws(()=>validateBackup({version:1,memories:[memory,memory]}));
  assert.throws(()=>validateBackup({version:1,memories:[{...memory,dishes:[dish,dish]}]}));
  assert.throws(()=>validateBackup({version:1,memories:[{...memory,dishes:[{...dish,x:1.1}]}]}));
  assert.throws(()=>validateBackup({version:2,memories:[memory]}));
});
