window.MolassiShared = (() => {
 const key='molassi:shared-password';
 const password=()=>sessionStorage.getItem(key)||'';
 async function request(action, fields={}, credential=password()) {
  const endpoint=window.MOLASSI_CONFIG.endpoint;
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) throw Error('Collegamento condiviso da configurare: inserire l’URL Google Apps Script in js/config.js.');
  const response=await fetch(endpoint,{method:'POST',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,password:credential,...fields}),signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('Servizio condiviso non raggiungibile.');
  const data=await response.json();
  if(!data.ok)throw Error(data.error||'Operazione non riuscita.');
  return data;
 }
 return {request,password,async login(value){await request('read',{},value);sessionStorage.setItem(key,value)},logout(){sessionStorage.removeItem(key)}};
})();
