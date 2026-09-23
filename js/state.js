/* Shared authoritative state. No browser-local edits. */
window.MolassiState=(()=>{
 let units={},schemaVersion=1,ready=false,warning=null,queue=Promise.resolve();
 const listeners=new Set(),allowed=[null,'available','reserved','sold'];
 const emit=()=>listeners.forEach(fn=>fn());
 function accept(data){
  if(!data.units||typeof data.units!=='object')throw Error('Risposta condivisa non valida.');
  for(const row of Object.values(data.units))if(!row||!allowed.includes(row.status)||!Number.isInteger(row.version))throw Error('Stato condiviso non valido.');
  schemaVersion=data.schemaVersion||1;units=data.units;ready=true;warning=null;emit();
 }
 function serial(fn){const task=queue.then(fn);queue=task.catch(()=>{});return task}
 async function refresh(){return serial(async()=>{try{accept(await MolassiShared.request('read'))}catch(e){warning='Sincronizzazione interrotta: '+e.message;emit();throw e}})}
 async function set(id,status,details={},expectedVersion){
  if(!ready||!MolassiRepository.get(id)||!allowed.includes(status))return false;
  if(schemaVersion<2){warning='Aggiornare Google Apps Script alla versione con venditore e cliente prima di salvare.';return false}
  const version=expectedVersion??(units[id]?.version||0);
  return serial(async()=>{try{accept(await MolassiShared.request('write',{id,status,version,seller:details.seller??(units[id]?.seller||''),client:details.client??(units[id]?.client||'')}));return true}catch(e){warning=e.message;emit();return false}});
 }
 async function start(){await refresh();document.documentElement.classList.remove('app-pending');poll()}
 function poll(){setTimeout(async()=>{if(!document.hidden)try{await refresh()}catch{}poll()},Math.max(3000,MOLASSI_CONFIG.pollMs||5000))}
 return {get warning(){return warning},get ready(){return ready},get(id){return Object.hasOwn(units,id)?units[id].status:MolassiRepository.get(id).status},record(id){return {status:this.get(id),seller:units[id]?.seller||'',client:units[id]?.client||'',version:units[id]?.version||0}},set,refresh,start,subscribe(fn){listeners.add(fn)}};
})();
