import { useEffect, useRef, useState, type FormEvent } from 'react';

import { formSearchRequest, readPlaces, type SearchPlace } from './placeSearchModel';
export type { SearchPlace } from './placeSearchModel';
const cache=new Map<string,SearchPlace[]>();
export default function PlaceSearch({choose,close}:{choose:(place:SearchPlace)=>void;close:()=>void}) {
  const [mode,setMode]=useState<'spain'|'abroad'>('spain');
  const [street,setStreet]=useState(''),[city,setCity]=useState(''),[country,setCountry]=useState('');
  const [results,setResults]=useState<SearchPlace[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const controller=useRef<AbortController|null>(null);
  const active=useRef(true);
  useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort();};},[]);
  async function search(event:FormEvent){
    event.preventDefault();if(busy)return;
    let request:ReturnType<typeof formSearchRequest>;
    try{request=formSearchRequest({mode,street,city,country});}catch(error){setResults([]);setMessage((error as Error).message);return;}
    const key=request.url.toString();
    setResults([]);setMessage('');setBusy(true);
    const abort=new AbortController();controller.current=abort;
    const timeout=window.setTimeout(()=>abort.abort(),15000);
    try{
      let places=cache.get(key);
      if(!places){
        const {url,country}=request;
        const response=await fetch(url,{signal:abort.signal});if(!response.ok)throw new Error();
        places=readPlaces(await response.json(),country,mode!=='spain'||!street.trim()).slice(0,6);cache.set(key,places);
      }
      if(active.current){setResults(places);if(!places.length)setMessage('No se encontraron coincidencias. Revisa el nombre de la ciudad o de la calle.');}
    }catch{if(active.current)setMessage('No se pudo realizar la búsqueda. Comprueba la conexión y vuelve a intentarlo.');}
    finally{window.clearTimeout(timeout);if(active.current)setBusy(false);}
  }
  return <section className="place-search" aria-label="Buscar ciudad o lugar">
    <header><strong>Buscar ciudad o lugar</strong><button onClick={close} aria-label="Cerrar búsqueda">×</button></header>
    <form className="geographic-search-form" onSubmit={search}>
      <fieldset disabled={busy}><legend>¿Dónde quieres buscar?</legend><div className="search-options">
        <label><input type="radio" name="search-area" checked={mode==='spain'} onChange={()=>{setMode('spain');setResults([]);setMessage('');}}/> España</label>
        <label><input type="radio" name="search-area" checked={mode==='abroad'} onChange={()=>{setMode('abroad');setResults([]);setMessage('');}}/> Fuera de España</label>
      </div>
      {mode==='spain'&&<><label htmlFor="search-street">1. Calle (opcional)</label><input id="search-street" value={street} onChange={e=>setStreet(e.target.value)} placeholder="Ej.: Calle de Alcalá" maxLength={160}/></>}
      <label htmlFor="search-city">{mode==='spain'?'2':'1'}. Ciudad</label><input id="search-city" required value={city} onChange={e=>setCity(e.target.value)} placeholder={mode==='spain'?'Ej.: Madrid':'Ej.: Varsovia'} maxLength={120}/>
      <label htmlFor="search-country">{mode==='spain'?'3':'2'}. País</label><input id="search-country" required readOnly={mode==='spain'} value={mode==='spain'?'España':country} onChange={e=>setCountry(e.target.value)} placeholder="Ej.: Polonia" maxLength={100}/>
      <p className="search-example">{mode==='spain'?'Calle de Alcalá, Madrid, España':'Varsovia, Polonia'}</p>
      <button className="submit-place-search" disabled={busy||city.trim().length<2||(mode==='abroad'&&!country.trim())}>{busy?'Buscando…':'Buscar'}</button>
      </fieldset>
    </form>
    <div role="status">{message}</div>
    <ul>{results.map((place,i)=><li key={i}><button onClick={()=>choose(place)}>{place.name}<span>Ir a este lugar →</span></button></li>)}</ul>
    <small>Las búsquedas se envían a Photon. Datos de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>.</small>
    <button type="button" className="screen-back" aria-label="Volver al mapa" onClick={close}>‹</button>
  </section>;
}
