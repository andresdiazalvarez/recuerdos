import { useEffect, useMemo, useRef, useState } from 'react';

import maplibregl, { type Map as MapLibreMap, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import Memories from './Memories';
import { normalize, useMemoryStore, type Seed } from './memoryStore';

type Place = { id: string; name: string; region: string; country: string; coords: [number, number]; dates: string[]; description: string };
const sample: Place[] = [
  {id:'canos', name:'Los Caños de Meca',region:'Cádiz',country:'España',coords:[-5.9658,36.1852],dates:['2025-08-18','2026-04-09'],description:'Lugar de demostración. Añade tu panorámica con la fecha de tu visita.'},
  {id:'trafalgar',name:'Faro de Trafalgar',region:'Cádiz',country:'España',coords:[-6.0331,36.1809],dates:['2026-04-09','2026-09-14'],description:'Segundo lugar de demostración, independiente del primero.'}
];
const initialView: [number,number] = [-5.5,35.6];
const formatDate = (s:string) => new Date(`${s}T12:00:00`).toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
type Section = 'inicio' | 'mapa' | 'lugares' | 'fechas' | 'panoramas' | 'platos';
export default function App(){
  const {memories,ready,error,save} = useMemoryStore();
  const places: Place[] = useMemo(()=>[...sample,...memories.map(m=>({id:m.id,name:m.place,region:'Recuerdo personal',country:'',coords:m.coords,dates:[m.date],description:'Panorámica guardada en este dispositivo.'}))],[memories]);
  const [seed,setSeed] = useState<Seed|null>(null);
  const [memoryId,setMemoryId] = useState<string|null>(null);
  const [placing,setPlacing] = useState(false);
  const [section,setSection] = useState<Section>('inicio');
  const [selected,setSelected] = useState<string | null>(null);
  const [target,setTarget] = useState<{id:string;token:number}|null>(null);
  const [query,setQuery] = useState('');
  const [status,setStatus] = useState('');
  const mapRef = useRef<MapLibreMap|null>(null);
  const mapNodeRef = useRef<HTMLDivElement|null>(null);
  const cardRef = useRef<HTMLElement|null>(null);
  const markersRef = useRef<Marker[]>([]);
  const selectedPlace = places.find(x=>x.id===selected);
  const goTo = (id:string) => {setSelected(id);setTarget({id,token:Date.now()});setSection('mapa');};
  const openMap = () => {setSelected(null);setTarget(null);setPlacing(false);setSection('mapa');};
  const openMemories = (next: 'panoramas'|'platos'|'fechas', id: string|null = null) => {setSeed(null);setMemoryId(id);setSection(next);};
  const addAt = (newSeed: Seed) => {setSeed(newSeed);setMemoryId(null);setPlacing(false);setSection('panoramas');};
  useEffect(()=>{
    if(section!=='mapa'||!mapNodeRef.current||mapRef.current)return;
    let disposed=false;
    setStatus('');
    const map = new maplibregl.Map({container:mapNodeRef.current,style:'https://tiles.openfreemap.org/styles/liberty',center:initialView,zoom:1.65,minZoom:1,maxZoom:19,attributionControl:false});
    mapRef.current=map;
    map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');
    map.on('load',()=>{
      if(disposed)return;
      setStatus('');
      try{map.setProjection({type:'globe'});}catch{setStatus('La vista esférica no está disponible con esta configuración; se muestra el mapa continuo.');}
      markersRef.current=places.map(place=>{
        const el=document.createElement('button');el.className='place-marker';el.type='button';el.setAttribute('aria-label',`Abrir ${place.name}`);el.innerHTML='<span></span>';
        el.addEventListener('click',e=>{e.stopPropagation();goTo(place.id);});
        return new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(place.coords).addTo(map);
      });
    });
    map.on('error',e=>{if(!disposed){console.error('Error cartográfico',e.error);setStatus('No se han podido cargar algunos elementos del mapa. Comprueba la conexión.');}});
    return ()=>{disposed=true;markersRef.current.forEach(x=>x.remove());markersRef.current=[];map.remove();mapRef.current=null;};
  },[section,places]);
  useEffect(()=>{
    const map=mapRef.current;
    if(section!=='mapa'||!map)return;
    map.getCanvas().style.cursor=placing?'crosshair':'';
    const choose=(event: maplibregl.MapMouseEvent)=>{if(placing)addAt({place:'',coords:[event.lngLat.lng,event.lngLat.lat]});};
    map.on('click',choose);
    return ()=>{map.off('click',choose);};
  },[section,placing]);
  useEffect(()=>{
    if(section!=='mapa'||!target||!mapRef.current)return;
    const place=places.find(x=>x.id===target.id);if(!place)return;
    const map=mapRef.current;
    const jump=()=>map.flyTo({center:place.coords,zoom:13,essential:true,duration:1800,
      offset:[-22,(50-(cardRef.current?.getBoundingClientRect().height ?? 0))/2]});
    if(map.isStyleLoaded())jump();else map.once('load',jump);
    return ()=>{map.off('load',jump);};
  },[target,section,places]);
  const back=()=>{if(selected){setSelected(null);mapRef.current?.flyTo({zoom:8,center:selectedPlace?.coords ?? [-6.0,36.2],essential:true});}else setSection('inicio');};
  return <main>
    {section==='inicio'&&<div className="home"><div className="earth" aria-hidden="true">◎</div><div className="hero"><p className="eyebrow">MIS LUGARES · MIS FECHAS</p><h1>Mapa de<br/>Recuerdos</h1><p className="intro">Explora el mundo y vuelve a los lugares que guardan tus recuerdos.</p></div><nav className="home-buttons"><button onClick={openMap}><span>◉</span> MAPA <b>›</b></button><button onClick={()=>openMemories('panoramas')}><span>▧</span> PANORÁMICAS <b>›</b></button><button onClick={()=>openMemories('platos')}><span>♧</span> PLATOS <b>›</b></button><button onClick={()=>setSection('lugares')}><span>⌖</span> LUGARES <b>›</b></button><button onClick={()=>openMemories('fechas')}><span>▦</span> FECHAS <b>›</b></button></nav><small>Tus panorámicas · Tus platos · Tus recuerdos</small></div>}
    {section==='mapa'&&<div className="map-screen"><div ref={mapNodeRef} className="map"/><div className="topbar"><button aria-label="Atrás" onClick={back}>‹</button><strong>Mapa de Recuerdos</strong><button aria-label="Inicio" onClick={()=>setSection('inicio')}>⌂</button></div><div className="map-tools"><button aria-label="Acercar" onClick={()=>mapRef.current?.zoomIn()}>+</button><button aria-label="Alejar" onClick={()=>mapRef.current?.zoomOut()}>−</button><button aria-label="Ir a Cádiz" onClick={()=>mapRef.current?.flyTo({center:[-6.0,36.2],zoom:10,essential:true})}>⌖</button></div><button className="map-add" disabled={!ready} onClick={()=>{setSelected(null);setPlacing(!placing);}}>{placing ? 'Cancelar ubicación' : '+ Añadir panorámica'}</button><div className="map-hint">{placing ? 'Toca el punto del mapa para guardar tu panorámica' : 'Pulsa un marcador para abrir su lugar · Pellizca para acercar'}</div>{status&&<div className="notice" role="status">{status}<button onClick={()=>setStatus('')}>×</button></div>}{selectedPlace&&<article ref={cardRef} className="place-card"><div className="card-grip"/><p className="eyebrow">{sample.some(p=>p.id===selectedPlace.id)?'LUGAR DE DEMOSTRACIÓN':'RECUERDO PERSONAL'}</p><h2>{selectedPlace.name}</h2><p>{selectedPlace.region}{selectedPlace.country && `, ${selectedPlace.country}`}</p><p className="desc">{selectedPlace.description}</p><div className="date-tags">{selectedPlace.dates.map(d=><span key={d}>{formatDate(d)}</span>)}</div><button className="primary" disabled={!ready} onClick={()=>addAt({place:selectedPlace.name,coords:selectedPlace.coords})}>Añadir panorámica aquí</button>{memories.filter(m=>m.id===selectedPlace.id || (normalize(m.place)===normalize(selectedPlace.name))).map(m=><button className="listing-item" key={m.id} onClick={()=>openMemories('panoramas',m.id)}><span>▧ {formatDate(m.date)} · {m.place}</span><b>›</b></button>)}<button className="close-card" onClick={()=>setSelected(null)}>Cerrar ficha</button></article>}</div>}
    {section==='lugares'&&<div className="listing"><header><button onClick={()=>setSection('inicio')} aria-label="Volver">‹</button><h1>Lugares</h1><button onClick={openMap} aria-label="Mapa">◉</button></header><p>Selecciona un lugar para viajar hasta él en el mapa.</p><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar un lugar..." aria-label="Buscar lugar"/>{places.filter(p=>normalize(`${p.name} ${p.region} ${p.country}`).includes(normalize(query))).map(p=><button className="listing-item" onClick={()=>goTo(p.id)} key={p.id}><span><strong>{p.name}</strong><small>{p.region}, {p.country}</small><small>{p.dates.map(formatDate).join(' · ')}</small></span><b>›</b></button>)}</div>}
    {(section==='fechas'||section==='panoramas'||section==='platos')&&<Memories key={section} memories={memories} ready={ready} save={save} mode={section==='platos'?'platos':'panoramas'} seed={seed} initialId={memoryId} home={()=>setSection('inicio')} showMap={goTo}/>}
    {error&&<div className="storage-error" role="alert">{error}</div>}
  </main>
}


