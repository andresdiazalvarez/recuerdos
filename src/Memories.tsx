import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatDate, matchesMemory, readImage, validateBackup, type Dish, type Memory, type Seed } from './memoryStore';

type Props = { memories: Memory[]; ready: boolean; save: (records: Memory[]) => Promise<void>; mode: 'panoramas' | 'platos'; seed: Seed | null; initialId: string | null; home: () => void; showMap: (id: string) => void };
export default function Memories({ memories, ready, save, mode, seed, initialId, home, showMap }: Props) {
  const [creating, setCreating] = useState(!!seed);
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [dishId, setDishId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exact, setExact] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const active = memories.find(m => m.id === activeId);
  const open = (id: string, dish: string | null = null) => { setActiveId(id); setDishId(dish); setMessage(''); };
  const exportBackup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, memories })], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `recuerdos-copia-${new Date().toISOString().slice(0,10)}.json`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Copia descargada. Guárdala en un lugar seguro: contiene tus fotos y ubicaciones.');
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const records = validateBackup(JSON.parse(await file.text()));
      // Existing memories win: restoration adds missing records without overwriting edits.
      const existing = new Set(memories.map(m => m.id));
      const additions = records.filter(m => !existing.has(m.id));
      await save(additions); setMessage(`Copia restaurada: ${additions.length} recuerdos añadidos. Los existentes se han conservado.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo restaurar la copia.'); }
    finally { setBusy(false); }
  };
  if (creating) return <CreateMemory seed={seed} ready={ready} save={save} cancel={() => setCreating(false)} done={id => { setCreating(false); open(id); }} />;
  if (active) return <Panorama memory={active} selectedDish={dishId} selectDish={setDishId} save={save} back={() => { setActiveId(null); setDishId(null); }} showMap={() => showMap(active.id)} />;
  const matches = (m: Memory, dish?: Dish) => matchesMemory(m,{query,place:placeQuery,exact,from,to},dish);
  const sorted = [...memories].sort((a,b) => b.date.localeCompare(a.date) || a.place.localeCompare(b.place, 'es'));
  const rows = mode === 'platos' ? sorted.flatMap(m => m.dishes.filter(d => matches(m,d)).map(d => ({ memory: m, dish: d }))) : sorted.filter(m => matches(m)).map(m => ({ memory: m, dish: null }));
  return <div className="listing memories"><header><button onClick={home} aria-label="Inicio">⌂</button><h1>{mode === 'platos' ? 'Platos' : 'Fechas y lugares'}</h1><button onClick={() => setCreating(true)} disabled={!ready} aria-label="Añadir panorámica">+</button></header>
    <p>{mode === 'platos' ? 'Busca un plato por nombre o etiqueta y vuelve al punto donde lo guardaste.' : 'Encuentra dónde estuviste y abre la panorámica de ese día.'}</p>
    <button className="primary" disabled={!ready} onClick={() => setCreating(true)}>Añadir panorámica</button>
    <div className="filters"><label>{mode === 'platos' ? 'Plato o etiqueta' : 'Buscar recuerdo'}<input value={query} onChange={e => setQuery(e.target.value)} placeholder={mode === 'platos' ? 'Atún, arroz, postre…' : 'Fecha, lugar o plato…'} /></label>
      <label>Lugar<input value={placeQuery} onChange={e => setPlaceQuery(e.target.value)} placeholder="Los Caños de Meca…" /></label>
      <label>Fecha exacta<input type="date" value={exact} onChange={e => { setExact(e.target.value); setFrom(''); setTo(''); }} /></label>
      <details><summary>Buscar entre dos fechas</summary><div className="two-fields"><label>Desde<input type="date" value={from} onChange={e => { setFrom(e.target.value); setExact(''); }} /></label><label>Hasta<input type="date" value={to} onChange={e => { setTo(e.target.value); setExact(''); }} /></label></div></details>
      <button className="secondary" onClick={() => { setQuery(''); setPlaceQuery(''); setFrom(''); setTo(''); setExact(''); }}>Limpiar filtros</button></div>
    {from && to && from > to ? <p role="alert">La fecha inicial debe ser anterior o igual a la final.</p> : <><p role="status">{rows.length} {mode === 'platos' ? 'platos' : 'panorámicas'} encontrados</p>
      {rows.map(({ memory: m, dish }) => <button className="listing-item memory-row" key={`${m.id}-${dish?.id ?? ''}`} onClick={() => open(m.id, dish?.id)}><img src={dish?.image ?? m.image} alt=""/><span><strong>{dish?.name ?? m.place}</strong><small>{formatDate(m.date)}</small><small>{m.place}</small><small>{dish?.tags || `${m.dishes.length} platos`}</small></span><b>›</b></button>)}
      {!rows.length && <div className="empty">{memories.length ? 'No hay resultados con estos filtros.' : 'Todavía no hay panorámicas guardadas. Añade la primera desde aquí o elige un punto en el mapa.'}{mode === 'platos' && <p>Para guardar un plato, abre una panorámica, pulsa «Añadir plato» y elige un punto en la imagen.</p>}</div>}</>}
    <section className="backup"><h2>Copia de seguridad</h2><p>Las fotos se guardan en este navegador y dispositivo. Si borras sus datos, se perderán. Descarga una copia para conservarlas o llevarlas a otro móvil.</p><button className="secondary" onClick={exportBackup} disabled={!ready || busy || !memories.length}>Descargar copia</button><label className="file-button">Restaurar copia<input type="file" accept=".json,application/json" disabled={!ready || busy} onChange={e => { void importBackup(e.target.files?.[0]); e.target.value = ''; }} /></label></section>
    {message && <p className="feedback" role="status">{message}</p>}
  </div>;
}

function CreateMemory({ seed, ready, save, cancel, done }: { seed: Seed | null; ready: boolean; save: Props['save']; cancel: () => void; done: (id: string) => void }) {
  const [date, setDate] = useState('');
  const [place, setPlace] = useState(seed?.place ?? '');
  const [lat, setLat] = useState(seed ? String(seed.coords[1]) : '');
  const [lng, setLng] = useState(seed ? String(seed.coords[0]) : '');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const reading = useRef(0);
  const chooseImage = async (file?: File) => {
    const token = ++reading.current; setImage(''); setError(''); if (!file) return;
    setBusy(true);
    try { const result = await readImage(file); if (reading.current === token) setImage(result); }
    catch (e) { if (reading.current === token) setError((e as Error).message); }
    finally { if (reading.current === token) setBusy(false); }
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!image || !place.trim() || !date || !lat.trim() || !lng.trim()) { setError('Añade fecha, lugar, coordenadas y una panorámica.'); return; }
    const coords: [number,number] = [Number(lng), Number(lat)];
    if (!coords.every(Number.isFinite) || Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 85) { setError('Coordenadas no válidas: latitud entre −85 y 85 y longitud entre −180 y 180.'); return; }
    setBusy(true);
    try { const id = crypto.randomUUID(); await save([{ id, date, place: place.trim(), coords, image, dishes: [] }]); done(id); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="listing memories"><header><button onClick={cancel} disabled={busy} aria-label="Cancelar">‹</button><h1>Nueva panorámica</h1></header><p>Primero la fecha; después, el lugar y la imagen de ese recuerdo.</p>
    <form onSubmit={submit}><label>Fecha del recuerdo<input required type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>Lugar<input required maxLength={160} value={place} onChange={e => setPlace(e.target.value)} placeholder="Nombre del lugar o restaurante" /></label>
      <label>Panorámica<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void chooseImage(e.target.files?.[0])}/></label><p className="muted">JPG, PNG o WebP, hasta 25 MB. Puedes recorrer una foto panorámica horizontal y acercarla.</p>{image && <img className="upload-preview" src={image} alt="Vista previa de la panorámica"/>}
      <details open={!seed}><summary>Ubicación en el mapa</summary><p>Para elegirla sin escribir coordenadas, vuelve al mapa y pulsa «Añadir panorámica»; después toca el punto.</p><div className="two-fields"><label>Latitud<input required type="number" step="any" min="-85" max="85" value={lat} onChange={e => setLat(e.target.value)} /></label><label>Longitud<input required type="number" step="any" min="-180" max="180" value={lng} onChange={e => setLng(e.target.value)} /></label></div></details>
      {error && <p className="feedback" role="alert">{error}</p>}<button className="primary" disabled={busy || !ready}>{busy ? 'Guardando…' : 'Guardar panorámica'}</button><button type="button" className="secondary" onClick={cancel} disabled={busy}>Cancelar</button></form>
  </div>;
}

function Panorama({ memory, selectedDish, selectDish, save, back, showMap }: { memory: Memory; selectedDish: string | null; selectDish: (id: string | null) => void; save: Props['save']; back: () => void; showMap: () => void }) {
  const viewport = useRef<HTMLDivElement|null>(null);
  const surface = useRef<HTMLDivElement|null>(null);
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(2);
  const [placing, setPlacing] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number }|null>(null);
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const reading = useRef(0);
  const dish = memory.dishes.find(d => d.id === selectedDish);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const view = viewport.current, imageSurface = surface.current;
      if (view && imageSurface && dish) view.scrollTo({ left: dish.x * imageSurface.clientWidth - view.clientWidth / 2, top: dish.y * imageSurface.clientHeight - view.clientHeight / 2, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedDish, zoom, aspect, dish]);
  const addDish = async (e: FormEvent) => {
    e.preventDefault(); if (!point || !name.trim() || !image) { setError('Elige el punto, escribe el nombre y añade la foto del plato.'); return; }
    setBusy(true); setError('');
    try {
      const id = crypto.randomUUID();
      await save([{ ...memory, dishes: [...memory.dishes, { id, name: name.trim(), tags: tags.trim(), image, ...point }] }]);
      setPoint(null); setPlacing(false); setName(''); setTags(''); setImage(''); selectDish(id);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="listing panorama-page"><header><button aria-label="Volver al listado" onClick={back}>‹</button><h1>{memory.place}</h1><button aria-label="Ver lugar en el mapa" onClick={showMap}>⌖</button></header><p className="memory-date">{formatDate(memory.date)}</p>
    <div className="panorama-toolbar"><button aria-label="Alejar panorámica" onClick={() => setZoom(z => Math.max(1,z-.5))}>−</button><span>{Math.round(zoom*100)} %</span><button aria-label="Acercar panorámica" onClick={() => setZoom(z => Math.min(4,z+.5))}>+</button><button onClick={() => { setPlacing(!placing); setPoint(null); setError(''); selectDish(null); }}> {placing ? 'Cancelar punto' : 'Añadir plato'}</button></div>
    <p className="muted">{placing ? 'Toca el punto de la panorámica donde quieres colocar la foto del plato.' : 'Desliza la panorámica y usa + para acercar. Pulsa un punto para ver su plato.'}</p>
    <div className={`panorama-viewport ${placing ? 'placing' : ''}`} ref={viewport}><div ref={surface} className="panorama-surface" style={{ width: `${Math.max(100,aspect*70)*zoom}%` }} onClick={e => {
      if (!placing) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setPoint({ x: Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)), y: Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height)) });
    }}><img src={memory.image} alt={`Panorámica de ${memory.place}`} draggable={false} onLoad={e => setAspect(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)} />
      {memory.dishes.map(d => <button key={d.id} className={`dish-pin ${selectedDish === d.id ? 'selected' : ''}`} style={{ left: `${d.x*100}%`, top: `${d.y*100}%` }} aria-label={`Ver plato ${d.name}`} onClick={e => { e.stopPropagation(); if (!placing) selectDish(d.id); }}><img src={d.image} alt=""/><span>{d.name}</span></button>)}
      {point && <span className="draft-pin" style={{ left: `${point.x*100}%`, top: `${point.y*100}%` }}>+</span>}
    </div></div>
    {placing && <button className="secondary" onClick={() => setPoint({x:.5,y:.5})}>Colocar en el centro de la imagen</button>}
    {point && <form className="dish-form" onSubmit={addDish}><h2>Nuevo plato</h2><label>Nombre del plato<input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Atún a la plancha" /></label><label>Etiquetas para buscar<input maxLength={240} value={tags} onChange={e => setTags(e.target.value)} placeholder="Atún, pescado, almuerzo" /></label><label>Foto del plato<input type="file" required accept="image/jpeg,image/png,image/webp" onChange={async e => {
      const token = ++reading.current; const file = e.target.files?.[0]; setImage(''); setError(''); if (!file) return; setBusy(true);
      try { const result = await readImage(file); if (token === reading.current) setImage(result); } catch (e) { setError((e as Error).message); } finally { if (token === reading.current) setBusy(false); }
    }} /></label>{image && <img className="dish-preview" src={image} alt="Vista previa del plato"/>}<p>Se guardará en {memory.place}, el {formatDate(memory.date)}.</p><button className="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar plato'}</button></form>}
    {error && <p className="feedback" role="alert">{error}</p>}
    {dish && <article className="dish-detail"><h2>{dish.name}</h2><img src={dish.image} alt={dish.name}/><p>{formatDate(memory.date)} · {memory.place}</p>{dish.tags && <p>{dish.tags}</p>}<button className="secondary" onClick={() => selectDish(null)}>Cerrar plato</button></article>}
    {!!memory.dishes.length && <section><h2>Platos de esta panorámica</h2>{memory.dishes.map(d => <button className="listing-item" key={d.id} onClick={() => selectDish(d.id)}><strong>{d.name}</strong><span>Ver punto ›</span></button>)}</section>}
  </div>;
}
