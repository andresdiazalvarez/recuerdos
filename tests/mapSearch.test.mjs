import test from 'node:test';
import assert from 'node:assert/strict';
import { spanishNames } from '../src/mapLanguage.ts';
import { readPlaces } from '../src/placeSearchModel.ts';
test('los nombres priorizan español y conservan los números de carretera',()=>{
 const localized=spanishNames(['coalesce',['get','name_en'],['get','name']]);
 assert.ok(JSON.stringify(localized).includes('name:es'));
 assert.ok(!JSON.stringify(localized).includes('name_en'));
 assert.deepEqual(spanishNames(['get','ref']),['get','ref']);
 assert.deepEqual(spanishNames(['case',['has','name:nonlatin'],['get','name:latin'],['get','name']]),['coalesce',['get','name:es'],['get','name_es'],['get','name'],['get','name:latin']]);
});
test('la búsqueda conserva coordenadas y transforma el encuadre y el país',()=>{
 const places=readPlaces({features:[{geometry:{coordinates:[-5.9658,36.1852]},properties:{name:'Los Caños de Meca',city:'Los Caños de Meca',countrycode:'es',extent:[-6,36.2,-5.9,36.1]}}]});
 assert.equal(places[0].name,'Los Caños de Meca, España');
 assert.deepEqual(places[0].coords,[-5.9658,36.1852]);
 assert.deepEqual(places[0].bounds,[-6,36.1,-5.9,36.2]);
});
test('descarta resultados sin nombre o con coordenadas inválidas',()=>{
 assert.deepEqual(readPlaces({features:[{geometry:{coordinates:[181,35]},properties:{name:'Inválido'}},{geometry:{coordinates:[0,0]}}]}),[]);
 assert.deepEqual(readPlaces({}),[]);
});

import { searchRequest } from '../src/placeSearchModel.ts';
test('Praga, Chequia usa un filtro real CZ y acepta países en español',()=>{
 for(const country of ['Chequia','República Checa','republica checa']){
  const request=searchRequest(`praga, ${country}`);
  assert.equal(request.url.searchParams.get('q'),'praga');
  assert.equal(request.url.searchParams.get('countrycode'),'CZ');
 }
 assert.equal(searchRequest('París, Francia').country,'FR');
 assert.equal(searchRequest('Los Caños de Meca, España').country,'ES');
 assert.equal(searchRequest('Calle Mayor, Madrid').url.searchParams.get('q'),'Calle Mayor, Madrid');
});
test('la capital checa aparece antes que hoteles y no se muestran otros países',()=>{
 const feature=(name,countrycode,osm_value)=>({geometry:{coordinates:[14.42,50.08]},properties:{name,countrycode,osm_value}});
 const places=readPlaces({features:[feature('Praga','PL','city'),feature('Praga','CZ','hotel'),feature('Praha','CZ','city')]},'CZ');
 assert.equal(places.length,2);
 assert.equal(places[0].name,'Praga (Praha), Chequia');
 assert.ok(places.every(p=>p.name.includes('Chequia')));
});

import { formSearchRequest } from '../src/placeSearchModel.ts';
test('España busca calle, ciudad y país; sin calle busca la ciudad',()=>{
 const request=formSearchRequest({mode:'spain',street:' Calle de Alcalá ',city:' Madrid ',country:''});
 assert.equal(request.url.searchParams.get('q'),'Calle de Alcalá, Madrid');
 assert.equal(request.country,'ES');
 assert.equal(request.url.searchParams.get('layer'),'street');
 assert.equal(formSearchRequest({mode:'spain',street:'',city:'Madrid',country:''}).url.searchParams.get('layer'),'city');
});
test('fuera de España solo usa ciudad y país y valida ambos',()=>{
 const request=formSearchRequest({mode:'abroad',street:'una calle oculta',city:'Varsovia',country:'Polonia'});
 assert.equal(request.url.searchParams.get('q'),'Varsovia');
 assert.equal(request.country,'PL');
 assert.equal(request.url.searchParams.get('layer'),'city');
 assert.throws(()=>formSearchRequest({mode:'abroad',street:'',city:'Varsovia',country:'inventado'}),/país/);
 assert.throws(()=>formSearchRequest({mode:'abroad',street:'',city:'',country:'Polonia'}),/ciudad/);
 assert.throws(()=>formSearchRequest({mode:'abroad',street:'',city:'Madrid',country:'España'}),/opción España/);
});
