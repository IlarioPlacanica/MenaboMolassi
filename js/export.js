/* Browser-side PDF export also works on GitHub Pages and below a repository path. */
window.MolassiExport=(()=>{
 'use strict';
 const colors={available:'#ffffff',reserved:'#ffcc00',sold:'#d32f2f'};
 const labels={available:'Disponibile',reserved:'Prenotato',sold:'Venduto'};
 let sourceBytes=null,sourceDocument=null,lastUrl=null;
 async function create(floorId,statuses,records={},context=null){
  if(!window.PDFLib)throw Error('Libreria PDF non caricata. Ricarica la pagina e verifica il file assets/vendor/pdf-lib.min.js.');
  const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
  const color=hex=>rgb(...hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255));
  const floor=MolassiRepository.floors.find(f=>f.id===floorId);
  if(!floor)throw Error('Piano non valido.');
  if(!sourceBytes){
   const url=new URL(window.MOLASSI_DATA.source,document.baseURI);
   const response=await fetch(url,{credentials:'same-origin',signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('PDF originale non disponibile ('+response.status+'). Verifica che sia incluso nella pubblicazione.');
   const bytes=new Uint8Array(await response.arrayBuffer());
   if(new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('Il file ricevuto non è un PDF. Accedi nuovamente o verifica il PDF pubblicato.');
   sourceBytes=bytes;
  }
  const original=sourceDocument||(sourceDocument=await PDFDocument.load(sourceBytes)),pdf=context?.pdf||await PDFDocument.create();
  const [page]=await pdf.copyPages(original,[floor.page-1]);pdf.addPage(page);
  const native=page.getMediaBox(),rotation=((page.getRotation().angle%360)+360)%360;
  const box={x:0,y:0,width:rotation%180?native.height:native.width,height:rotation%180?native.width:native.height};
  const {pushGraphicsState,popGraphicsState,concatTransformationMatrix}=PDFLib;
  page.pushOperators(pushGraphicsState());
  if(rotation===90)page.pushOperators(concatTransformationMatrix(0,1,-1,0,native.x+native.width,native.y));
  else if(rotation===180)page.pushOperators(concatTransformationMatrix(-1,0,0,-1,native.x+native.width,native.y+native.height));
  else if(rotation===270)page.pushOperators(concatTransformationMatrix(0,-1,1,0,native.x,native.y+native.height));
  else page.pushOperators(concatTransformationMatrix(1,0,0,1,native.x,native.y));
  const counts={available:0,reserved:0,sold:0};
  for(const unit of MolassiRepository.forFloor(floorId)){
   const raw=statuses[unit.id]??unit.status;const state=raw==null||raw==='unknown'?'available':raw;if(!Object.hasOwn(colors,state))throw Error('Stato non valido.');counts[state]++;
   // Pre-scale X and Y independently; source MediaBox has a non-zero origin.
   let coordinate=0;
   const path=unit.path.replace(/-?\d+(?:\.\d+)?/g,n=>String(Number(n)*(coordinate++%2===0?box.width/2400:box.height/1698)));
   page.drawSvgPath(path,{x:box.x,y:box.y+box.height,color:color(colors[state]),opacity:.45,borderColor:color(state==='available'?'#7c8c91':colors[state]),borderOpacity:.95,borderWidth:.65});
  }
  const font=context?.font||await pdf.embedFont(StandardFonts.Helvetica),bold=context?.bold||await pdf.embedFont(StandardFonts.HelveticaBold);
  if(context){context.font=font;context.bold=bold}
  const x=box.x+box.width*35/1600,y=box.y+box.height*(1-785/1132),ink=color('#293b35');
  const text=(value,yy,size=6.5,face=font)=>page.drawText(value,{x,y:yy,size,font:face,color:ink});
  text(floor.mapped?'STATI CORRENTI':'TAVOLA ORIGINALE',y,8,bold);
  const stamp=new Date().toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(/[^0-9/: ,]/g,'');
  text('Esportazione '+stamp,y-12);
  if(floor.mapped){
   Object.entries(labels).forEach(([state,label],i)=>{
    const yy=y-25-i*11;
    page.drawRectangle({x,y:yy-1,width:7,height:7,color:color(colors[state]),opacity:.45,borderColor:color(state==='available'?'#7c8c91':colors[state]),borderWidth:.5,borderOpacity:1});
    page.drawText(label+' ('+counts[state]+')',{x:x+12,y:yy,size:6.5,font,color:ink});
   });
  }
  
  page.pushOperators(popGraphicsState());
  pdf.setTitle('Corte Molassi - '+floor.label.replace('−','-')+' - stati aggiornati');
  if(!context)return pdf.save();
 }

 async function createAll(statuses,records={},progress=()=>{}){
  if(!window.PDFLib)throw Error('Libreria PDF non caricata. Ricarica la pagina e verifica il file assets/vendor/pdf-lib.min.js.');
  const context={pdf:await PDFLib.PDFDocument.create()};
  for(const floor of MolassiRepository.floors){
   progress('Preparazione: '+floor.label+'…');
   await new Promise(resolve=>setTimeout(resolve,0));
   await create(floor.id,statuses,records,context);
  }
  context.pdf.setTitle('Corte Molassi - Tutti i piani - stati aggiornati');
  return context.pdf.save();
 }
 async function download(progress){
  const statuses=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.get(u.id)||'available']));
  const records=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.record(u.id)]));
  const bytes=await createAll(statuses,records,progress);
  if(lastUrl)URL.revokeObjectURL(lastUrl);
  lastUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  let link=document.getElementById('pdf-download-ready');
  if(!link){link=document.createElement('a');link.id='pdf-download-ready';link.className='download-ready';document.getElementById('export-pdf').after(link)}
  link.href=lastUrl;link.download='Corte-Molassi-tutti-i-piani-aggiornato.pdf';link.textContent='PDF completo pronto: fai clic qui per scaricarlo';link.hidden=false;link.click();
 }
 return {create,createAll,download};
})();
