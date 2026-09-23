window.MolassiShared=(()=>{
 const key='molassi:shared-password',seedKey='molassi:login-snapshot';
 const password=()=>sessionStorage.getItem(key)||'';
 async function request(action,fields={},credential=password()){
  const endpoint=window.MOLASSI_CONFIG.endpoint;
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))throw Error('Collegamento Google Apps Script non configurato.');
  const attempts=action==='read'?2:1;
  for(let attempt=0;attempt<attempts;attempt++){
   let response;
   try{response=await fetch(endpoint,{method:'POST',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,password:credential,...fields}),signal:AbortSignal.timeout(20000)})}
   catch(e){
    if(attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,1200));continue}
    throw Error(action==='write'?'Conferma di salvataggio non ricevuta. Ricarica la scheda per verificare i dati prima di riprovare.':'Google non risponde o la connessione è interrotta. Riprova tra poco.');
   }
   if(!response.ok){
    if([429,500,502,503,504].includes(response.status)&&attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,1200));continue}
    throw Error([401,403].includes(response.status)?'Google rifiuta l’accesso alla distribuzione (HTTP '+response.status+').': 'Servizio Google temporaneamente non disponibile (HTTP '+response.status+'). Riprova tra poco.');
   }
   let data;try{data=await response.json()}catch{throw Error('Google ha restituito una risposta non valida. Verifica la distribuzione Apps Script.')}
   if(!data.ok)throw Error(data.error||'Operazione non riuscita.');
   return data;
  }
 }
 function takeSnapshot(){
  const raw=sessionStorage.getItem(seedKey);sessionStorage.removeItem(seedKey);
  try{const value=JSON.parse(raw);if(value&&value.endpoint===MOLASSI_CONFIG.endpoint&&Date.now()-value.time<30000)return value.data}catch{}
  return null;
 }
 return {request,password,takeSnapshot,async login(value){
  sessionStorage.removeItem(seedKey);
  const data=await request('read',{},value);
  sessionStorage.setItem(key,value);
  try{sessionStorage.setItem(seedKey,JSON.stringify({endpoint:MOLASSI_CONFIG.endpoint,time:Date.now(),data}))}catch{}
 },logout(){sessionStorage.removeItem(key);sessionStorage.removeItem(seedKey)}};
})();
