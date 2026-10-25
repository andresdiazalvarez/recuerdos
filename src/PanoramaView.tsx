import { useEffect, useRef, useState, type PointerEvent } from 'react';
import PhotoImage from './PhotoImage';
import { dateText, wrap, type MemoryPoint, type Panorama, type PlacedPhoto } from './model';
import { usePress } from './usePress';

type Props = { panorama: Panorama; point: MemoryPoint; photos: PlacedPhoto[]; siblings: Panorama[]; initialDirection: number; onDirection: (direction: number) => void; add: (direction: number, y: number) => void; full: (photo: PlacedPhoto) => void; edit: (photo: PlacedPhoto) => void; editing: string | null; move: (photo: PlacedPhoto, direction: number, y: number) => void; switchPanorama: (id: string) => void };
function Spot({ photo, direction, count, editMode, full, edit, move }: { photo: PlacedPhoto; direction: number; count: number; editMode: boolean; full: () => void; edit: () => void; move: Props['move'] }) {
  const press = usePress(full,edit);
  const [position,setPosition] = useState({direction:photo.direction,y:photo.y});
  const drag = useRef<{x:number;y:number;direction:number;relativeY:number;changed:boolean}|null>(null);
  useEffect(()=>setPosition({direction:photo.direction,y:photo.y}),[photo.direction,photo.y]);
  const x=wrap(position.direction-direction,count);
  const copies=[x,x-count].filter(value=>value> -photo.size && value<1+photo.size);
  const start = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);
    drag.current={x:e.clientX,y:e.clientY,direction:position.direction,relativeY:position.y,changed:false};
  };
  return <>{copies.map((x,index)=><button key={index} {...(!editMode?press:{
    onPointerDown:start,
    onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d)return;e.stopPropagation();const area=e.currentTarget.parentElement!.getBoundingClientRect();const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>4)d.changed=true;setPosition({direction:wrap(d.direction+dx/area.width,count),y:Math.max(.08,Math.min(.85,d.relativeY+dy/area.height))});},
    onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>{e.stopPropagation();if(drag.current?.changed)move(photo,position.direction,position.y);drag.current=null;},
    onPointerCancel:()=>{drag.current=null;setPosition({direction:photo.direction,y:photo.y});},
    onClick:(e:React.MouseEvent)=>e.stopPropagation(),onContextMenu:(e:React.MouseEvent)=>e.preventDefault(),
  })} className={`placed-photo ${editMode?'editing':''} ${photo.secondImageId?'double-photo':''}`} style={{left:`${x*100}%`,top:`${position.y*100}%`,width:`${photo.size*(photo.secondImageId?2:1)*100}%`}} aria-label={`Foto del ${dateText(photo.date)}${photo.text?` · ${photo.text}`:''}`}>
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
    {props.photos.map(photo=><Spot key={photo.id} photo={photo} direction={direction} count={n} editMode={props.editing===photo.id} full={()=>props.full(photo)} edit={()=>props.edit(photo)} move={props.move}/>)}
  </div><div className="panorama-title"><strong>{props.point.name||'Punto de recuerdo'}</strong><span>{dateText(props.point.date)}</span>{props.siblings.length>1&&<label>Panorámica<select value={props.panorama.id} onChange={e=>props.switchPanorama(e.target.value)}>{props.siblings.map((p,index)=><option key={p.id} value={p.id}>{index+1} de {props.siblings.length}</option>)}</select></label>}</div>
    {!moving&&!props.editing&&<p className="panorama-hint">Arrastra para girar · Toca un espacio vacío para añadir una foto · Mantén una foto para editar</p>}
  </div>;
}
