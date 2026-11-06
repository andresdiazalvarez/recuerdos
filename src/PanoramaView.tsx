import { useEffect, useRef, useState, type PointerEvent } from 'react';
import PhotoImage from './PhotoImage';
import { dateText, DOUBLE_MS, HOLD_MS, PHOTO_SIZE, wrap, type MemoryPoint, type Panorama, type PlacedPhoto } from './model';

type Props = { resize:(photo:PlacedPhoto)=>void; busy: boolean; reverse: () => void; panorama: Panorama; point: MemoryPoint; photos: PlacedPhoto[]; siblings: Panorama[]; initialDirection: number; onDirection: (direction: number) => void; add: (direction: number, y: number) => void; full: (photo: PlacedPhoto) => void; edit: (photo: PlacedPhoto) => void; editing: string | null; move: (photo: PlacedPhoto, direction: number, y: number) => void; switchPanorama: (id: string) => void };
function Spot({ photo, direction, count, editMode, full, edit, move, resize }: { photo: PlacedPhoto; direction: number; count: number; editMode: boolean; full: () => void; edit: () => void; move: Props['move']; resize:()=>void }) {
  const [position,setPosition]=useState({direction:photo.direction,y:photo.y});
  const latest=useRef(position);
  const drag=useRef<{id:number;x:number;y:number;direction:number;y0:number;changed:boolean;time:number}|null>(null);
  const tap=useRef<{time:number;timer:ReturnType<typeof setTimeout>}|null>(null);
  const cancelTap=()=>{if(tap.current)clearTimeout(tap.current.timer);tap.current=null;};
  useEffect(()=>{latest.current={direction:photo.direction,y:photo.y};setPosition(latest.current);},[photo.direction,photo.y]);
  useEffect(()=>()=>cancelTap(),[]);
  const x=wrap(position.direction-direction,count),displaySize=photo.size*1.5;
  const copies=[x,x-count].filter(value=>value> -displaySize&&value<1+displaySize);
  return <>{copies.map((x,index)=><button key={index}
    onPointerDown={(e:PointerEvent<HTMLButtonElement>)=>{e.stopPropagation();if(e.button!==0)return;e.preventDefault();if(tap.current)clearTimeout(tap.current.timer);if(drag.current){drag.current=null;cancelTap();return;}e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,direction:latest.current.direction,y0:latest.current.y,changed:false,time:performance.now()};}}
    onPointerMove={(e:PointerEvent<HTMLButtonElement>)=>{e.stopPropagation();const d=drag.current;if(!d||d.id!==e.pointerId)return;const area=e.currentTarget.parentElement!.getBoundingClientRect(),dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>9){d.changed=true;cancelTap();}if(d.changed){latest.current={direction:wrap(d.direction+dx/area.width,count),y:Math.max(.08,Math.min(.85,d.y0+dy/area.height))};setPosition(latest.current);}}}
    onPointerUp={(e:PointerEvent<HTMLButtonElement>)=>{e.stopPropagation();const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(d.changed){move(photo,latest.current.direction,latest.current.y);return;}if(performance.now()-d.time>=HOLD_MS){cancelTap();edit();return;}if(tap.current&&performance.now()-tap.current.time<=DOUBLE_MS){cancelTap();resize();return;}cancelTap();tap.current={time:performance.now(),timer:setTimeout(()=>{tap.current=null;if(!editMode)full();},DOUBLE_MS)};}}
    onPointerCancel={()=>{drag.current=null;cancelTap();latest.current={direction:photo.direction,y:photo.y};setPosition(latest.current);}}
    onClick={e=>{e.stopPropagation();if(e.detail===0)full();}} onContextMenu={e=>e.preventDefault()}
    className={`placed-photo ${editMode?'editing':''} ${photo.secondImageId?'double-photo':''}`} style={{left:`${x*100}%`,top:`${position.y*100}%`,width:`${displaySize*(photo.secondImageId?2:1)*100}%`,'--photo-height':`${225*photo.size/PHOTO_SIZE}px`} as React.CSSProperties} aria-label={`Foto del ${dateText(photo.date)}${photo.text?' · '+photo.text:''}`} title="Arrastra para mover · Dos toques para cambiar tamaño · Mantén para editar">
    <span className="photo-images"><PhotoImage imageId={photo.imageId} alt="Fotografía del recuerdo"/>{photo.secondImageId&&<PhotoImage imageId={photo.secondImageId} alt="Segunda fotografía"/>}</span><span className="photo-caption"><time>{dateText(photo.date)}</time>{photo.text&&<span>{photo.text}</span>}</span>
  </button>)}</>;
}
export default function PanoramaView(props: Props) {
  const n=props.panorama.backgrounds.length;
  const [direction,setDirection]=useState(props.initialDirection);
  const directionRef=useRef(direction);
  const [moving,setMoving]=useState(false);
  const gesture=useRef<{x:number;y:number;direction:number;moved:boolean}|null>(null);
  const pointers=useRef(new Set<number>());
  const change=(value:number)=>{const next=wrap(value,n);directionRef.current=next;setDirection(next);props.onDirection(next);};
  useEffect(()=>{change(props.initialDirection);},[props.panorama.id]);
  const base=Math.floor(direction);
  return <div className="panorama-screen"><div className="panorama-stage" aria-label="Panorámica: arrastra horizontalmente para girar" tabIndex={0}
    onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();change(directionRef.current-.1);}if(e.key==='ArrowRight'){e.preventDefault();change(directionRef.current+.1);}if(e.key==='Enter'){e.preventDefault();props.add(wrap(directionRef.current+.5,n),.5);}}}
    onPointerDown={e=>{if(e.button!==0)return;pointers.current.add(e.pointerId);if(pointers.current.size>1){gesture.current=null;return;}e.currentTarget.setPointerCapture(e.pointerId);gesture.current={x:e.clientX,y:e.clientY,direction:directionRef.current,moved:false};}}
    onPointerMove={e=>{const g=gesture.current;if(!g)return;const dx=e.clientX-g.x;if(Math.hypot(dx,e.clientY-g.y)>9){g.moved=true;setMoving(true);}if(g.moved)change(g.direction-dx/e.currentTarget.clientWidth);}}
    onPointerUp={e=>{pointers.current.delete(e.pointerId);const g=gesture.current;gesture.current=null;setMoving(false);if(!g||g.moved||pointers.current.size)return;const r=e.currentTarget.getBoundingClientRect();props.add(wrap(directionRef.current+(e.clientX-r.left)/r.width,n),Math.max(.08,Math.min(.85,(e.clientY-r.top)/r.height)));}}
    onPointerCancel={e=>{pointers.current.delete(e.pointerId);gesture.current=null;setMoving(false);}}
    onContextMenu={e=>e.preventDefault()}>
    {[-1,0,1,2].map(offset=>{const index=base+offset;return <div key={index} className="background-panel" style={{transform:`translateX(${(index-direction)*100}%)`}}><PhotoImage imageId={props.panorama.backgrounds[wrap(index,n)]} kind="medium" alt={`Fondo ${wrap(index,n)+1} de la panorámica`}/></div>;})}
    {props.photos.map(photo=><Spot key={photo.id} photo={photo} direction={direction} count={n} editMode={props.editing===photo.id} full={()=>props.full(photo)} edit={()=>props.edit(photo)} move={props.move} resize={()=>props.resize(photo)}/>)}
  </div><div className="panorama-title"><strong>{props.point.name||'Punto de recuerdo'}</strong><span>{dateText(props.point.date)}</span>{props.panorama.backgrounds.length>1&&<button className="reverse-panorama" disabled={props.busy||!!props.editing} onClick={props.reverse} title="Cambia el orden de los fondos: el último pasa a ser el primero">⇄ Invertir orden</button>}{props.siblings.length>1&&<label>Panorámica<select value={props.panorama.id} onChange={e=>props.switchPanorama(e.target.value)}>{props.siblings.map((p,index)=><option key={p.id} value={p.id}>{index+1} de {props.siblings.length}</option>)}</select></label>}</div>
    {!moving&&!props.editing&&<p className="panorama-hint">Arrastra para girar · Toca un espacio vacío para añadir una foto · Arrastra una foto para moverla · Dos toques para cambiar su tamaño</p>}
  </div>;
}
