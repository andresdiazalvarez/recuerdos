import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl, { type GeoJSONSource, type Map as MapType, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { dateText, DOUBLE_MS, type MemoryPoint, type View } from './model';
import { usePress } from './usePress';
import { createMapTaps } from './mapTaps';
import { accuracyText, locationZoom, requestLocation } from './location';

type Props = { points: MemoryPoint[]; draftCoords?: [number,number]; available: Set<string>; visible: boolean; request: { view: View; token: number; arrive?: string }; onView: (v: View) => void; onLabels: (labels: Record<string,string>) => void; onLocate: () => void; remember: (v: View) => void; create: (coords: [number, number], view: View, labels: Record<string,string>) => void; select: (id: string) => void; upload: (id: string) => void; arrive: (id: string) => void };
export const captureView = (map: MapType): View => ({ center: [map.getCenter().lng,map.getCenter().lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() });
function PointPin({ point, available, select, upload }: { point: MemoryPoint; available: boolean; select: () => void; upload: () => void }) {
  const press = usePress(select, upload);
  return <button {...press} className={`point-pin ${available ? 'has-panorama' : ''}`} data-point={point.id} aria-label={`${point.date} · ${point.name || 'Punto de recuerdo'}${available ? ' · Abrir panorámica' : ' · Pendiente de panorámica'}`} title="Mantén pulsado para cargar la panorámica"><i/ ><span>{dateText(point.date)}</span></button>;
}
export default function WorldMap(props: Props) {
  const node = useRef<HTMLDivElement>(null); const mapRef = useRef<MapType|null>(null); const current = useRef(props); current.current = props;
  const [loaded,setLoaded] = useState(false); const [error,setError] = useState('');
  const [pins,setPins] = useState<Array<{ point: MemoryPoint; marker: Marker; element: HTMLElement }>>([]);
  const markers = useRef(new Map<string,{ point: MemoryPoint; marker: Marker; element: HTMLElement }>());
  const lastDouble = useRef(0);
  const locationMarker = useRef<Marker|null>(null);
  const locationRequest = useRef(0);
  const [locating,setLocating] = useState(false);
  const [locationStatus,setLocationStatus] = useState('');
  const cancelTap = useRef<()=>void>(()=>{});
  const locate = async () => {
    const map=mapRef.current;
    if(!map||locating)return;
    const token=++locationRequest.current;
    cancelTap.current();
    setLocating(true);setLocationStatus('');
    // Discard the previous fix, so an unsuccessful refresh cannot display stale coordinates.
    locationMarker.current?.remove();locationMarker.current=null;
    try {
      const fix=await requestLocation(navigator.geolocation,window.isSecureContext);
      if(token!==locationRequest.current||mapRef.current!==map||!current.current.visible)return;
      current.current.remember(captureView(map));
      current.current.onLocate();
      const element=document.createElement('div');element.className='user-location';element.dataset.userLocation='true';
      element.setAttribute('role','img');element.setAttribute('aria-label','Tu ubicación aproximada');
      const label=document.createElement('span');label.textContent='Estás aquí';element.append(label);
      locationMarker.current=new maplibregl.Marker({element,anchor:'center'}).setLngLat(fix.coords).addTo(map);
      element.removeAttribute('tabindex');
      const time=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
      setLocationStatus(`Tu ubicación · ${time} · Precisión aproximada ${accuracyText(fix.accuracy)}`);
      map.flyTo({center:fix.coords,zoom:locationZoom(fix.accuracy),duration:1200,essential:true});
    } catch(error) {
      if(token===locationRequest.current)setLocationStatus(error instanceof Error?error.message:'No se pudo obtener la ubicación.');
    } finally { if(token===locationRequest.current)setLocating(false); }
  };
  useEffect(()=>{
    if(!props.visible){locationRequest.current++;setLocating(false);setLocationStatus('');locationMarker.current?.remove();locationMarker.current=null;}
  },[props.visible]);
  useEffect(() => {
    if (!node.current) return;
    let map: MapType;
    try { map = new maplibregl.Map({ container: node.current, style:'https://tiles.openfreemap.org/styles/liberty', ...props.request.view, minZoom:1, maxZoom:19, doubleClickZoom:false, attributionControl:false }); }
    catch { setError('No se pudo iniciar el mapa. Este navegador necesita WebGL habilitado.'); return; }
    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');
    const refreshPins = () => {
      if (!map.getLayer('memory-points')) return;
      current.current.onLabels(labelsAt(map.getContainer().clientWidth/2,map.getContainer().clientHeight/2));
      const visible = new Set(map.queryRenderedFeatures({layers:['memory-points']}).map(f=>String(f.properties.id)));
      const byId = new Map(current.current.points.map(p=>[p.id,p]));
      for (const [key,pin] of markers.current) if(!visible.has(key)||!byId.has(key)){pin.marker.remove();markers.current.delete(key);}
      for (const key of visible) {
        const point=byId.get(key); if(!point||markers.current.has(key))continue;
        const element=document.createElement('div');
        const marker=new maplibregl.Marker({element,anchor:'bottom'}).setLngLat(point.coords).addTo(map);
        element.removeAttribute('role');element.removeAttribute('tabindex');element.removeAttribute('aria-label');
        markers.current.set(key,{point,marker,element});
      }
      setPins([...markers.current.values()]);
    };
    map.on('load',()=>{
      try{map.setProjection({type:'globe'});}catch{/* Continue with the same navigable flat map. */}
      map.addSource('memories',{type:'geojson',data:{type:'FeatureCollection',features:[]},cluster:true,clusterRadius:44,clusterMaxZoom:16});
      map.addLayer({id:'memory-clusters',type:'circle',source:'memories',filter:['has','point_count'],paint:{'circle-color':'#225f65','circle-radius':22,'circle-stroke-width':3,'circle-stroke-color':'#fff'}});
      map.addLayer({id:'memory-count',type:'symbol',source:'memories',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':13,'text-font':['Noto Sans Regular']},paint:{'text-color':'white'}});
      map.addLayer({id:'memory-points',type:'circle',source:'memories',filter:['!',['has','point_count']],paint:{'circle-radius':8,'circle-color':'#225f65','circle-stroke-width':2,'circle-stroke-color':'#fff'}});
      current.current.onView(captureView(map));
      setLoaded(true); setError('');
    });
    map.on('idle',refreshPins); map.on('moveend',()=>{const view=captureView(map);if(node.current){node.current.dataset.view=JSON.stringify(view);}current.current.onView(view);refreshPins();});
    map.on('movestart',event=>{ if(event.originalEvent){taps.cancel();current.current.remember(captureView(map));} });
    const labelsAt = (x:number,y:number) => {
      const result:Record<string,string>={};
      for(const feature of map.queryRenderedFeatures([x,y])) {
        const layer=(feature.layer?.id ?? '').toLowerCase(); const name=feature.properties?.['name:es'] || feature.properties?.name;
        if(typeof name!=='string')continue;
        if(layer.includes('country'))result.country=name;
        if(layer.includes('state')||layer.includes('province'))result.province=name;
        if(layer.includes('city')||layer.includes('town')||layer.includes('village'))result.municipality=name;
      }
      return result;
    };
    type MapTap = { x: number; y: number; coords: [number,number] };
    const createAt = (tap: MapTap) => {
      taps.cancel(); lastDouble.current=performance.now();
      current.current.create(tap.coords,captureView(map),labelsAt(tap.x,tap.y));
    };
    const taps = createMapTaps<MapTap>(tap=>{
      current.current.remember(captureView(map));map.flyTo({center:tap.coords,zoom:Math.min(19,map.getZoom()+2.2),duration:1100,essential:true});
    },createAt);
    cancelTap.current=taps.cancel;
    const tapAt = (x:number,y:number) => {
      const clusters=map.getLayer('memory-clusters')?map.queryRenderedFeatures([x,y],{layers:['memory-clusters']}):[];
      if(clusters.length){
        taps.cancel(); const feature=clusters[0];
        const source=map.getSource('memories') as GeoJSONSource;
        void source.getClusterExpansionZoom(Number(feature.properties.cluster_id)).then(zoom=>{current.current.remember(captureView(map));map.flyTo({center:(feature.geometry.type === 'Point' ? feature.geometry.coordinates : [0,0]) as [number,number],zoom:Math.min(19,zoom),duration:900});}).catch(()=>setError('No se pudo ampliar el grupo. Inténtalo de nuevo.'));return;
      }
      const coords=map.unproject([x,y]).wrap();
      if(!Number.isFinite(coords.lng)||!Number.isFinite(coords.lat))return;
      taps.tap({x,y,time:performance.now()},{x,y,coords:[coords.lng,coords.lat]});
    };
    // Handle touch taps directly: mobile browsers do not all synthesize dblclick.
    // Pinch and dragging remain MapLibre gestures and cancel the pending single tap.
    const container=map.getCanvasContainer();
    const fingers=new Set<number>();
    let touch:{id:number;x:number;y:number;blocked:boolean}|null=null;
    let lastTouch=-Infinity;
    const isCanvas=(event:PointerEvent)=>(event.target as HTMLElement).tagName==='CANVAS';
    const down=(event:PointerEvent)=>{
      if(event.pointerType==='mouse'||!isCanvas(event))return;
      lastTouch=performance.now();fingers.add(event.pointerId);
      if(fingers.size>1){if(touch)touch.blocked=true;taps.cancel();return;}
      touch={id:event.pointerId,x:event.clientX,y:event.clientY,blocked:false};
    };
    const move=(event:PointerEvent)=>{
      if(touch?.id===event.pointerId&&Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>9){touch.blocked=true;taps.cancel();}
    };
    const up=(event:PointerEvent)=>{
      if(event.pointerType==='mouse')return;
      lastTouch=performance.now();fingers.delete(event.pointerId);
      if(touch?.id!==event.pointerId)return;
      const start=touch;touch=null;
      if(start.blocked||fingers.size)return;
      const rect=container.getBoundingClientRect();
      tapAt(event.clientX-rect.left,event.clientY-rect.top);
    };
    const cancel=(event:PointerEvent)=>{fingers.delete(event.pointerId);touch=null;taps.cancel();};
    container.addEventListener('pointerdown',down);
    container.addEventListener('pointermove',move);
    container.addEventListener('pointerup',up);
    container.addEventListener('pointercancel',cancel);
    map.on('click',event=>{
      if(performance.now()-lastTouch<800||(event.originalEvent.target as HTMLElement)?.closest('[data-point],[data-user-location]'))return;
      tapAt(event.point.x,event.point.y);
    });
    map.on('dblclick',event=>{event.preventDefault();if(performance.now()-lastTouch<800||(event.originalEvent.target as HTMLElement)?.closest('[data-point],[data-user-location]'))return;if(map.getLayer('memory-clusters')&&map.queryRenderedFeatures(event.point,{layers:['memory-clusters']}).length)return;if(performance.now()-lastDouble.current>DOUBLE_MS)createAt({x:event.point.x,y:event.point.y,coords:[event.lngLat.wrap().lng,event.lngLat.lat]});});
    map.on('error',()=>setError('Algunas teselas no se han cargado. Comprueba la conexión; tus puntos se conservan.'));
    return ()=>{locationRequest.current++;locationMarker.current?.remove();locationMarker.current=null;taps.cancel();container.removeEventListener('pointerdown',down);container.removeEventListener('pointermove',move);container.removeEventListener('pointerup',up);container.removeEventListener('pointercancel',cancel);for(const pin of markers.current.values())pin.marker.remove();markers.current.clear();map.remove();mapRef.current=null;};
  },[]);
  useEffect(()=>{
    const map=mapRef.current;
    if(!map||!props.draftCoords||!props.visible)return;
    const element=document.createElement('div');element.className='draft-point';element.textContent='Nuevo punto';
    const marker=new maplibregl.Marker({element,anchor:'bottom'}).setLngLat(props.draftCoords).addTo(map);
    return ()=>{marker.remove();};
  },[props.draftCoords,props.visible]);
  useEffect(()=>{
    const map=mapRef.current;if(!map||!loaded)return;
    void (map.getSource('memories') as GeoJSONSource).setData({type:'FeatureCollection',features:props.points.map(point=>({type:'Feature',properties:{id:point.id},geometry:{type:'Point',coordinates:point.coords}}))});
  },[props.points,loaded]);
  useEffect(()=>{
    const map=mapRef.current;if(!map||!loaded||!props.visible)return;
    map.resize();
    const request=props.request;
    const arrived=()=>{if(request.arrive)current.current.arrive(request.arrive);};
    map.once('moveend',arrived);
    map.flyTo({...request.view,duration:1000,essential:true});
    if(!map.isMoving()){const view=captureView(map);if(node.current)node.current.dataset.view=JSON.stringify(view);current.current.onView(view);if(request.arrive){map.off('moveend',arrived);arrived();}}
    return ()=>{map.off('moveend',arrived);};
  },[props.request.token,props.visible,loaded]);
  return <div className="world-map" aria-hidden={!props.visible}><div ref={node} className="map-canvas" aria-label="Mapa mundial"/>
    {pins.map(pin=>createPortal(<PointPin point={pin.point} available={props.available.has(pin.point.id)} select={()=>props.select(pin.point.id)} upload={()=>props.upload(pin.point.id)}/>,pin.element,pin.point.id))}
    {error&&<div className="map-error" role="status">{error}<button aria-label="Cerrar aviso" onClick={()=>setError('')}>×</button></div>}
    {props.visible&&<><button className="locate-button" onClick={()=>void locate()} disabled={locating||!loaded} aria-busy={locating}><span aria-hidden="true">⌾</span> {locating?'Buscando…':'Mi ubicación'}</button>{locationStatus&&<div className="location-status" role="status">{locationStatus}<button aria-label="Cerrar aviso de ubicación" onClick={()=>setLocationStatus('')}>×</button></div>}</>}
    {props.visible&&<div className="zoom-controls"><button aria-label="Acercar" onClick={()=>{const map=mapRef.current;if(map){props.remember(captureView(map));map.zoomIn({duration:450});}}}>+</button><button aria-label="Alejar" onClick={()=>{const map=mapRef.current;if(map){props.remember(captureView(map));map.zoomOut({duration:450});}}}>−</button></div>}
  </div>;
}
