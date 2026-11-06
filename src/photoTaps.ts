// Resolve a whole sequence before acting: a triple tap must not also enlarge.
export function createPhotoTaps(single:()=>void,double:()=>void,triple:()=>void,delay=420,schedule:(fn:()=>void,ms:number)=>unknown=setTimeout,clear:(id:unknown)=>void=id=>clearTimeout(id as ReturnType<typeof setTimeout>)){
 let count=0,timer:unknown;
 const pause=()=>{if(timer!==undefined)clear(timer);timer=undefined;};
 const cancel=()=>{pause();count=0;};
 return {pause,cancel,tap:()=>{pause();count++;if(count===3){count=0;triple();return;}timer=schedule(()=>{const taps=count;cancel();if(taps===2)double();else single();},delay);}};
}
