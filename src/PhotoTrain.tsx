import { useRef, type PointerEvent } from 'react';
import PhotoImage from './PhotoImage';
import { dateText, type PlacedPhoto } from './model';

export default function PhotoTrain({photos,open}:{photos:PlacedPhoto[];open:(photo:PlacedPhoto)=>void}) {
  const gesture=useRef<{id:number;x:number;y:number;scroll:number;photo?:string;moved:boolean}|null>(null);
  const start=(event:PointerEvent<HTMLDivElement>)=>{
    if(event.button!==0)return;
    if(gesture.current){gesture.current=null;return;}
    const photo=(event.target as HTMLElement).closest<HTMLElement>('[data-train-photo]')?.dataset.trainPhoto;
    gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,scroll:event.currentTarget.scrollLeft,photo,moved:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  return <div className="photo-train" role="region" aria-label="Tren de fotos: arrastra para mover todas las fotos" tabIndex={0}
    onPointerDown={start}
    onPointerMove={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x;if(Math.hypot(dx,event.clientY-g.y)>9)g.moved=true;if(g.moved)event.currentTarget.scrollLeft=g.scroll-dx;}}
    onPointerUp={event=>{const g=gesture.current;if(g?.id!==event.pointerId)return;gesture.current=null;if(!g.moved&&g.photo){const photo=photos.find(p=>p.id===g.photo);if(photo)open(photo);}}}
    onPointerCancel={()=>{gesture.current=null;}}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.currentTarget.scrollBy({left:event.key==='ArrowLeft'?-260:260,behavior:'smooth'});}}}
    onContextMenu={event=>event.preventDefault()}>
    {photos.length?<div className="photo-train-row">{photos.map((photo,index)=><button key={photo.id} className={`train-card ${photo.secondImageId?'train-double':''}`} data-train-photo={photo.id} aria-label={`Abrir foto ${index+1} del ${dateText(photo.date)}${photo.text?' · '+photo.text:''}`} onClick={event=>{event.preventDefault();if(event.detail===0)open(photo);}}>
      <span className="train-images"><PhotoImage imageId={photo.imageId} kind="thumbnail" alt="Fotografía del recuerdo"/>{photo.secondImageId&&<PhotoImage imageId={photo.secondImageId} kind="thumbnail" alt="Segunda fotografía"/>}</span>
      <span className="train-caption"><time>{dateText(photo.date)}</time>{photo.text&&<span>{photo.text}</span>}</span>
    </button>)}</div>:<p className="train-empty">Todavía no hay fotos. Vuelve a la panorámica y toca un punto para añadir la primera.</p>}
  </div>;
}
