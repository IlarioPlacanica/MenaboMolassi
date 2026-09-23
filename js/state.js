/* Versioned storage adapter. Unknown source data remains null. */
window.MolassiState = (() => {
 const KEY='corte-molassi:statuses:v1', allowed=['available','reserved','sold'];
 let overrides={}, warning=null;
 try { const raw=localStorage.getItem(KEY); if(raw){const parsed=JSON.parse(raw);if(parsed.version!==1 || typeof parsed.units!=='object' || parsed.units===null)throw Error();for(const [id,v] of Object.entries(parsed.units)){if(MolassiRepository.get(id)&&(v===null||allowed.includes(v)))overrides[id]=v;}} }
 catch { warning='Salvataggio locale non disponibile o dati non leggibili. Sono mostrati gli stati del PDF.'; }
 return {get warning(){return warning},get(id){return Object.hasOwn(overrides,id)?overrides[id]:MolassiRepository.get(id).status},set(id,status){if(!MolassiRepository.get(id)||(status!==null&&!allowed.includes(status)))throw Error('Stato non valido');const next={...overrides,[id]:status};try{localStorage.setItem(KEY,JSON.stringify({version:1,units:next}));overrides=next;warning=null;return true}catch{warning='Impossibile salvare in questo browser. Lo stato precedente è rimasto invariato.';return false}}};
})();