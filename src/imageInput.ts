export async function readablePhoto(file:File):Promise<Blob>{
 const label=file.name||'fotografía';
 if(file.size>25*1024*1024)throw new Error(`${label}: supera los 25 MB. Guarda una copia más pequeña.`);
 let data:ArrayBuffer;
 try{data=await file.arrayBuffer();}catch{throw new Error(`${label}: el móvil no ha podido entregar el archivo. Descárgalo primero al dispositivo y selecciónalo desde Archivos o Descargas.`);}
 if(!data.byteLength)throw new Error(`${label}: el archivo está vacío. Descarga la foto original al móvil y vuelve a seleccionarla.`);
 const bytes=new Uint8Array(data),ascii=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
 const type=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes[0]===137&&ascii(1,4)==='PNG'?'image/png':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':'';
 if(!type){
  if(ascii(4,8)==='ftyp'||/hei[cf]|heic|heif/i.test(file.type+' '+label))throw new Error(`${label}: este formato HEIC/HEIF u otro formato de alta eficiencia no está admitido. Exporta una copia JPG y carga esa copia.`);
  throw new Error(`${label}: el contenido no es una foto JPG, PNG o WebP válida. Guarda o exporta una copia JPG y vuelve a probar.`);
 }
 return new Blob([data],{type});
}
