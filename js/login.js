(() => {
 'use strict';
 const form=document.getElementById('login-form'),button=document.getElementById('login-submit'),error=document.getElementById('login-error');
 if(location.protocol==='file:'){error.textContent='Avvia prima AVVIA-MOLASSI.cmd, quindi apri http://127.0.0.1:8765.';button.disabled=true;return}
 form.addEventListener('submit',async event=>{
  event.preventDefault();button.disabled=true;error.textContent='';
  try{
   const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:form.elements.password.value})});
   if(response.ok){location.replace('/');return}
   error.textContent='Password non corretta. Riprova.';form.elements.password.select();
  }catch{error.textContent='Impossibile collegarsi. Verifica che l’app sia avviata.'}
  finally{button.disabled=false}
 });
})();
