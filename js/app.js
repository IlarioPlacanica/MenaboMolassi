/* UI, geometry repository and status storage remain separate. */
(() => {
 'use strict';
 if(location.protocol==='file:'){location.replace('login.html');return}
 if(!MolassiAccess.check())return;
 const repo=window.MolassiRepository,state=window.MolassiState,$=id=>document.getElementById(id);
 const labels={available:'Disponibile',reserved:'Prenotato',sold:'Venduto',unknown:'Da verificare'};
 let floor='p1',selected=null,zoom=1,dirty=false,editVersion=0;
 const current=()=>repo.forFloor(floor),status=u=>state.get(u.id)||'unknown',floorInfo=()=>repo.floors.find(f=>f.id===floor);
 const areaText=u=>u.commercialArea===null?'Superficie non indicata':u.commercialArea+' m²';
 const message=text=>{$('notice').textContent=text};
 repo.floors.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.label;$('floor').append(o)});$('floor').value=floor;
 $('plan').setAttribute('viewBox',repo.viewBox.join(' '));
 function detail(id){
  const u=current().find(u=>u.id===id);$('details').hidden=!u;
  if(!u){$('unit-title').textContent='Scegli uno spazio';$('unit-subtitle').textContent=floorInfo().mapped?'Seleziona sulla mappa o nell’elenco.':'Sezioni dei fabbricati · tavola consultabile ed esportabile.';return}
  $('unit-title').textContent=u.id;
  const type=u.role==='soffitta'?'Soffitta':u.role==='soppalco'?'Soppalco':u.type[0].toUpperCase()+u.type.slice(1);
  $('unit-subtitle').textContent=type+' · '+floorInfo().label;
  const s=status(u);$('status-badge').textContent=labels[s];$('status-badge').className='badge '+s;
  $('area').textContent=areaText(u);$('rooms').textContent=u.rooms??'Da verificare';$('price').textContent=u.price===null?'Da verificare':u.price+' €';
  $('unit-note').textContent=u.notes||'Dati letti dalla tavola; locali e prezzo non assegnati per deduzione.';
  $('source-note').textContent='Fonte: pagina '+u.sourcePage+' · '+floorInfo().emissionDate+(repo.get(id).status==='sold'?' · Venduto nel PDF.':' · Stato iniziale non dichiarato.');
  $('status').value=s;
  const record=state.record(id);$('seller').value=record.seller;$('client').value=record.client;
  $('seller-value').textContent=record.seller||'Non indicata';$('client-value').textContent=record.client||'Non indicato';
  editVersion=record.version;
  const editable=$('edit').checked&&selected===id;$('edit-controls').hidden=!editable;$('edit-hint').hidden=editable;
  $('edit-hint').textContent=$('edit').checked?'Seleziona l’unità con un clic per modificarla.':'Attiva la modalità modifica per aggiornare lo stato.';
 }
 function choose(id){dirty=false;selected=id;renderStates();detail(id)}
 function renderStates(){
  const list=current(),only=$('available').checked,query=$('unit-search').value.trim().toUpperCase();
  const counts={available:0,reserved:0,sold:0,unknown:0};list.forEach(u=>counts[status(u)]++);
  $('counters').replaceChildren();
  for(const [key,n] of [['total',list.length],...Object.entries(counts)]){const el=document.createElement('div');el.className='counter';const num=document.createElement('strong');num.textContent=n;el.append(num,document.createTextNode(key==='total'?'Unità del piano':labels[key]));$('counters').append(el)}
  document.querySelectorAll('.unit').forEach(p=>{
   const u=repo.get(p.dataset.id),s=status(u);p.setAttribute('class','unit '+s+(selected===u.id?' selected':'')+(only&&s!=='available'?' filtered':''));
   p.setAttribute('aria-label',u.id+' · '+labels[s]+' · '+areaText(u));p.setAttribute('aria-pressed',String(selected===u.id));
  });
  $('unit-list').replaceChildren();
  const shown=list.filter(u=>(!only||status(u)==='available')&&u.id.includes(query)).sort((a,b)=>a.id.localeCompare(b.id,'it',{numeric:true}));
  $('list-count').textContent=floorInfo().mapped?shown.length+' / '+list.length:'Sezioni';
  shown.forEach(u=>{const b=document.createElement('button');b.className='unit-button';b.dataset.id=u.id;b.setAttribute('aria-pressed',String(u.id===selected));b.append(document.createTextNode(u.id));const sub=document.createElement('span');sub.textContent=labels[status(u)]+' · '+areaText(u);b.append(sub);b.addEventListener('click',()=>choose(u.id));$('unit-list').append(b)});
  if(!shown.length){const p=document.createElement('p');p.className='note';p.textContent=list.length?'Nessuna unità corrisponde ai filtri.':'Questa tavola mostra le sezioni dei fabbricati.';$('unit-list').append(p)}
 }
 function setZoom(value){zoom=Math.max(1,Math.min(4,value));$('plan').style.width=zoom*100+'%';$('zoom-value').textContent=Math.round(zoom*100)+'%';$('zoom-out').disabled=zoom<=1;$('zoom-in').disabled=zoom>=4}
 function renderFloor(){
  const f=floorInfo();dirty=false;selected=null;$('counters').hidden=!f.mapped;$('plan-title').textContent=f.label;
  $('plan-hint').textContent=f.mapped?'Seleziona un’unità per i dettagli':'Sezioni originali dei fabbricati';
  $('plan-image').setAttribute('href',f.image);$('units').replaceChildren();$('available').checked=false;$('available').disabled=!f.mapped;$('edit').disabled=!f.mapped;$('unit-search').value='';$('unit-search').disabled=!f.mapped;
  current().forEach(u=>{
   const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',u.path);p.setAttribute('class','unit');p.dataset.id=u.id;p.setAttribute('role','button');p.setAttribute('tabindex','0');
   p.addEventListener('click',()=>choose(u.id));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(u.id)}});
   p.addEventListener('pointerenter',()=>{if(!selected)detail(u.id)});p.addEventListener('pointerleave',()=>{if(!selected)detail(null)});p.addEventListener('focus',()=>{if(!selected)detail(u.id)});p.addEventListener('blur',()=>{if(!selected)detail(null)});$('units').append(p);
  });
  setZoom(1);$('viewport').scrollTo(0,0);renderStates();detail(null);
 }
 $('floor').addEventListener('change',()=>{floor=$('floor').value;renderFloor()});$('edit').addEventListener('change',()=>{dirty=false;detail(selected)});$('unit-search').addEventListener('input',renderStates);
 $('available').addEventListener('change',()=>{if(selected&&$('available').checked&&status(repo.get(selected))!=='available')selected=null;renderStates();detail(selected)});
 $('zoom-in').addEventListener('click',()=>setZoom(zoom+.5));$('zoom-out').addEventListener('click',()=>setZoom(zoom-.5));$('fit').addEventListener('click',()=>{setZoom(1);$('viewport').scrollTo(0,0)});
 $('save').addEventListener('click',async()=>{
  if(!$('edit').checked||!selected)return;const id=selected,value=$('status').value;
  $('save').disabled=true; const saved=await state.set(id,value==='unknown'?null:value,{seller:$('seller').value.trim(),client:$('client').value.trim()},editVersion); $('save').disabled=false; if(saved){dirty=false;message('Scheda di '+id+' salvata: '+labels[value]+'. Aggiornato in tutte le tavole dell’unità.');if($('available').checked&&value!=='available')selected=null;renderStates();detail(selected)}else {const reason=state.warning;message(reason);await state.refresh().catch(()=>{});if(selected===id){dirty=false;detail(id);message(reason+' Scheda ricaricata: verifica i dati prima di riprovare.')}}
 });
 $('export-pdf').addEventListener('click',async()=>{
  const button=$('export-pdf'),f=floorInfo();button.disabled=true;button.textContent='Preparazione PDF…';message('Esportazione di '+f.label+' con tutti gli stati correnti, indipendentemente da filtri e zoom.');
  try{if(dirty)throw Error('Salva la scheda prima di scaricare il PDF.');await state.refresh();await MolassiExport.download(f.id);message('PDF di '+f.label+' pronto. Il file contiene la tavola e il riepilogo di stato, venditore e cliente per ogni unità.')}
  catch(error){message(error.message)}finally{button.disabled=false;button.textContent='Scarica PDF del piano'}
 });
 $('logout').addEventListener('click',async()=>{
  if(MolassiAccess.isStatic){MolassiAccess.logout();return}
  try{const r=await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(r.ok||r.status===401)location.replace('/login.html');else throw Error()}
  catch{message('Uscita non riuscita. Verifica che il server sia attivo e riprova.')}
 });
 async function checkSession(){if(MolassiAccess.isStatic){MolassiAccess.check();return}try{const r=await fetch('/api/session');if(r.status===401)location.replace('/login.html')}catch{message('Collegamento al server interrotto. Gli stati rimangono salvati in questo browser.')}}
 window.addEventListener('pageshow',checkSession);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSession()});
 $('plan-image').addEventListener('error',()=>message('Impossibile caricare la tavola. Verifica la connessione o accedi nuovamente.'));
 ['status','seller','client'].forEach(id=>$(id).addEventListener('input',()=>{dirty=true}));
 state.subscribe(()=>{
  const draft={status:$('status').value,seller:$('seller').value,client:$('client').value,version:editVersion};
  renderStates();
  if(selected){detail(selected);if($('edit').checked&&dirty){$('status').value=draft.status;$('seller').value=draft.seller;$('client').value=draft.client;editVersion=draft.version}}
  message(state.warning||'Stati condivisi aggiornati. Controllo automatico ogni 5 secondi.');
 });
 renderFloor();
 state.start().catch(error=>{
  document.documentElement.classList.remove('app-pending');
  document.querySelector('main').hidden=true;
  const alert=document.createElement('p');alert.setAttribute('role','alert');alert.textContent=error.message+' Rientra dalla schermata di accesso.';document.body.append(alert);
 });
})();

