import test from 'node:test';
import assert from 'node:assert/strict';
import {readablePhoto} from '../src/imageInput.ts';
test('identifica JPG por contenido aunque el móvil entregue tipo vacío o incorrecto',async()=>{
 const blob=await readablePhoto(new File([new Uint8Array([255,216,255,224])],'foto.bin',{type:'application/octet-stream'}));assert.equal(blob.type,'image/jpeg');assert.equal(blob.size,4);
});
test('explica archivos vacíos, no disponibles y HEIC sin aceptarlos como JPG',async()=>{
 await assert.rejects(readablePhoto(new File([],'vacia.jpg')),/vacío/);
 await assert.rejects(readablePhoto(new File(['xxxxftypheic'],'foto.jpg',{type:'image/jpeg'})),/HEIC/);
 await assert.rejects(readablePhoto({name:'nube.jpg',size:3,arrayBuffer:async()=>{throw new Error();}}),/Descárgalo/);
});
