const normalizeCountry=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('es');
const countryNames=new Map<string,string>();
const displayNames=new Intl.DisplayNames(['es'],{type:'region'});
// DisplayNames supplies Spanish country names without maintaining a translation list.
const codes='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
for(const code of codes){const name=displayNames.of(code);if(name)countryNames.set(normalizeCountry(name),code);}
for(const [name,code] of [['república checa','CZ'],['chequia','CZ'],['czechia','CZ'],['czech republic','CZ'],['reino unido','GB'],['inglaterra','GB'],['estados unidos','US'],['eeuu','US'],['holanda','NL']])countryNames.set(normalizeCountry(name),code);
export function searchRequest(text:string):{url:URL;country?:string}{
  const parts=text.split(',').map(p=>p.trim());
  const suffix=parts.at(-1)||'';
  const country=parts.length>1?countryNames.get(normalizeCountry(suffix)):undefined;
  const query=country?parts.slice(0,-1).join(', '):text.trim();
  const url=new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q',query);url.searchParams.set('limit','12');
  if(country)url.searchParams.set('countrycode',country);
  return {url,country};
}
export type SearchFields={mode:'spain'|'abroad';street:string;city:string;country:string};
export function formSearchRequest(fields:SearchFields):{url:URL;country:string}{
  const city=fields.city.trim();if(city.length<2)throw new Error('Escribe la ciudad que quieres buscar.');
  const country=fields.mode==='spain'?'ES':countryNames.get(normalizeCountry(fields.country));
  if(!country)throw new Error('No reconozco ese país. Escribe su nombre completo en español.');
  if(fields.mode==='abroad'&&country==='ES')throw new Error('Para buscar en España, elige la opción España.');
  const url=new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q',fields.mode==='spain'&&fields.street.trim()?fields.street.trim()+', '+city:city);
  url.searchParams.set('countrycode',country);url.searchParams.set('limit','12');
  url.searchParams.set('layer',fields.mode==='spain'&&fields.street.trim()?'street':'city');
  return {url,country};
}
export type SearchPlace = { name: string; coords: [number,number]; bounds?: [number,number,number,number] };
export function readPlaces(data: { features?: Array<{ geometry?: { coordinates?: number[] }; properties?: Record<string,unknown> }> }, expectedCountry?:string, prioritizeCities=true): SearchPlace[] {
  const countries = new Intl.DisplayNames(['es'],{type:'region'});
  return (data.features || []).filter(feature=>!expectedCountry||String(feature.properties?.countrycode).toUpperCase()===expectedCountry)
    .sort((a,b)=>{
      const rank=(p:Record<string,unknown>|undefined)=>p?.osm_value==='city'?0:p?.osm_value==='town'?1:2;
      return prioritizeCities?rank(a.properties)-rank(b.properties):0;
    }).flatMap(feature=>{
    const coords=feature.geometry?.coordinates, p=feature.properties || {};
    if(!coords || coords.length<2 || !coords.every(Number.isFinite) || Math.abs(coords[0])>180 || Math.abs(coords[1])>90)return [];
    const code=typeof p.countrycode==='string'?p.countrycode.toUpperCase():'';
    const country=/^[A-Z]{2}$/.test(code)?countries.of(code):p.country;
    const localName=code==='CZ'&&p.name==='Praha'&&p.osm_value==='city'?'Praga (Praha)':p.name;
    const name=[localName,p.street,p.city===p.name?undefined:p.city,p.state,country].filter((v,i,a)=>typeof v==='string'&&v&&a.indexOf(v)===i).join(', ');
    const extent=p.extent;
    const bounds=Array.isArray(extent)&&extent.length===4&&extent.every(Number.isFinite)?[extent[0],extent[3],extent[2],extent[1]] as [number,number,number,number]:undefined;
    return name?[{name,coords:[coords[0],coords[1]] as [number,number],bounds}]:[];
  });
}
