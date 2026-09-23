window.MolassiAccess=(()=>{
 const loginUrl=()=>new URL('login.html',document.baseURI).href;
 function logout(){MolassiShared.logout();location.replace(loginUrl())}
 function check(){if(!MolassiShared.password()){location.replace(loginUrl());return false}return true}
 return {isStatic:true,logout,check,loginUrl};
})();
