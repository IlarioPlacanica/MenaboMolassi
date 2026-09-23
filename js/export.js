window.MolassiExport=(()=>{
 'use strict';
 return {async download(floor){
  const statuses=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.get(u.id)||'unknown']));
  const response=await fetch('/api/export/'+encodeURIComponent(floor),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({statuses})});
  if(response.status===401){location.replace('/login.html');throw Error('Sessione scaduta: accedi nuovamente.')}
  if(!response.ok)throw Error('Esportazione non riuscita. Verifica che il server e il PDF originale siano disponibili.');
  const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Corte-Molassi-'+floor+'-aggiornato.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }};
})();
