import test from 'node:test';
import assert from 'node:assert/strict';
import { requestLocation, locationZoom, accuracyText } from '../src/location.ts';

test('consulta una vez, solicita una posición actual y conserva orden longitud/latitud',async()=>{
  let calls=0;
  const fix=await requestLocation({getCurrentPosition(success,_error,options){calls++;assert.deepEqual(options,{enableHighAccuracy:true,maximumAge:0,timeout:15000});success({coords:{latitude:36.1852,longitude:-5.9658,accuracy:12}});}},true);
  assert.deepEqual(fix,{coords:[-5.9658,36.1852],accuracy:12});assert.equal(calls,1);
});
test('no solicita ubicación en una conexión insegura ni si el navegador carece de soporte',async()=>{
  let called=false;
  await assert.rejects(requestLocation({getCurrentPosition(){called=true;}},false),/HTTPS/);
  assert.equal(called,false);await assert.rejects(requestLocation(undefined,true),/navegador/);
});
test('explica permiso denegado, falta de señal y tiempo agotado',async()=>{
  for(const [code,message] of [[1,/permitido/],[2,/activada/],[3,/tardado/]]) await assert.rejects(requestLocation({getCurrentPosition(_ok,fail){fail({code});}},true),message);
});
test('rechaza coordenadas o precisión no válidas',async()=>{
  for(const coords of [{latitude:91,longitude:0,accuracy:5},{latitude:0,longitude:181,accuracy:5},{latitude:NaN,longitude:0,accuracy:5},{latitude:0,longitude:0,accuracy:-1}]) await assert.rejects(requestLocation({getCurrentPosition(ok){ok({coords});}},true),/no válida/);
});
test('la precisión aproximada limita el zoom y se expresa en metros o kilómetros',()=>{
  assert.equal(locationZoom(20),15);assert.equal(locationZoom(500),13);assert.equal(locationZoom(10000),10);assert.equal(locationZoom(50000),8);
  assert.equal(accuracyText(12.4),'±13 m');assert.equal(accuracyText(1200),'±1,2 km');
});
