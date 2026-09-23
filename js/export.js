/* Browser-side PDF export also works on GitHub Pages and below a repository path. */
window.MolassiExport=(()=>{
 'use strict';
 const colors={unknown:'#667a83',available:'#27845a',reserved:'#bd8417',sold:'#d32f2f'};
 const labels={unknown:'Da verificare',available:'Disponibile',reserved:'Riservato',sold:'Venduto'};
 let sourceBytes=null,lastUrl=null;
 async function create(floorId,statuses){
  if(!window.PDFLib)throw Error('Libreria PDF non caricata. Ricarica la pagina e verifica il file assets/vendor/pdf-lib.min.js.');
  const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
  const color=hex=>rgb(...hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255));
  const floor=MolassiRepository.floors.find(f=>f.id===floorId);
  if(!floor)throw Error('Piano non valido.');
  if(!sourceBytes){
   const url=new URL(window.MOLASSI_DATA.source,document.baseURI);
   const response=await fetch(url,{credentials:'same-origin'});
   if(!response.ok)throw Error('PDF originale non disponibile ('+response.status+'). Verifica che sia incluso nella pubblicazione.');
   const bytes=new Uint8Array(await response.arrayBuffer());
   if(new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('Il file ricevuto non è un PDF. Accedi nuovamente o verifica il PDF pubblicato.');
   sourceBytes=bytes;
  }
  const original=await PDFDocument.load(sourceBytes),pdf=await PDFDocument.create();
  const [page]=await pdf.copyPages(original,[floor.page-1]);pdf.addPage(page);
  const box=page.getMediaBox(),counts={unknown:0,available:0,reserved:0,sold:0};
  for(const unit of MolassiRepository.forFloor(floorId)){
   const state=statuses[unit.id]??'unknown';if(!Object.hasOwn(colors,state))throw Error('Stato non valido.');counts[state]++;
   // Pre-scale X and Y independently; source MediaBox has a non-zero origin.
   let coordinate=0;
   const path=unit.path.replace(/-?\d+(?:\.\d+)?/g,n=>String(Number(n)*(coordinate++%2===0?box.width/2400:box.height/1698)));
   page.drawSvgPath(path,{x:box.x,y:box.y+box.height,color:color(colors[state]),opacity:state==='unknown'?0:state==='sold'?1:.16,borderColor:color(colors[state]),borderOpacity:state==='unknown'?.45:.95,borderWidth:.65});
  }
  const font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const x=box.x+box.width*35/1600,y=box.y+box.height*(1-785/1132),ink=color('#293b35');
  const text=(value,yy,size=6.5,face=font)=>page.drawText(value,{x,y:yy,size,font:face,color:ink});
  text(floor.mapped?'STATI CORRENTI':'TAVOLA ORIGINALE',y,8,bold);
  const stamp=new Date().toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(/[^0-9/: ,]/g,'');
  text('Esportazione '+stamp,y-12);
  if(floor.mapped){
   Object.entries(labels).forEach(([state,label],i)=>{
    const yy=y-25-i*11;
    page.drawRectangle({x,y:yy-1,width:7,height:7,color:color(colors[state]),opacity:state==='unknown'?0:state==='sold'?1:.3,borderColor:color(colors[state]),borderWidth:.5,borderOpacity:1});
    page.drawText(label+' ('+counts[state]+')',{x:x+12,y:yy,size:6.5,font,color:ink});
   });
   text('Le scritte della fonte restano visibili.',y-80);text('La campitura indica lo stato corrente.',y-89);
  }
  pdf.setTitle('Corte Molassi - '+floor.label.replace('−','-')+' - stati aggiornati');
  return pdf.save();
 }
 async function download(floor){
  const statuses=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.get(u.id)||'unknown']));
  const bytes=await create(floor,statuses);
  if(lastUrl)URL.revokeObjectURL(lastUrl);
  lastUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  let link=document.getElementById('pdf-download-ready');
  if(!link){link=document.createElement('a');link.id='pdf-download-ready';link.className='download-ready';document.getElementById('notice').after(link)}
  link.href=lastUrl;link.download='Corte-Molassi-'+floor+'-aggiornato.pdf';link.textContent='PDF pronto: fai clic qui per scaricarlo';link.hidden=false;link.click();
 }
 return {create,download};
})();
