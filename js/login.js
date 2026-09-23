(()=>{
 const form=document.getElementById('login-form'),button=document.getElementById('login-submit'),error=document.getElementById('login-error');
 form.addEventListener('submit',async event=>{
  event.preventDefault();button.disabled=true;error.textContent='Accesso in corso…';
  try{await MolassiShared.login(form.elements.password.value);location.replace(new URL('index.html',document.baseURI))}
  catch(e){error.textContent=e.message}
  finally{button.disabled=false}
 });
})();
