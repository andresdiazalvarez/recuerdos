import { useEffect, useState } from 'react';
import { readPicture } from './storage';
import type { Picture } from './model';
export default function PhotoImage({ imageId, kind = 'thumbnail', alt, className }: { imageId: string; kind?: 'thumbnail' | 'medium' | 'original'; alt: string; className?: string }) {
  const [url, setUrl] = useState(''); const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true; let objectUrl = ''; setUrl(''); setError(false);
    readPicture(imageId).then((picture: Picture) => { if (alive) { objectUrl = URL.createObjectURL(picture[kind]); setUrl(objectUrl); } }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [imageId, kind]);
  return url ? <img className={className} src={url} alt={alt} draggable={false}/> : <span className={`image-loading ${className ?? ''}`} role="status">{error ? 'Imagen no disponible' : 'Cargando imagen…'}</span>;
}
