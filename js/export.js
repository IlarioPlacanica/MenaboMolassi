/* Browser-side PDF export also works on GitHub Pages and below a repository path. */
window.MolassiExport=(()=>{
 'use strict';
 const colors={unknown:'#667a83',available:'#1565c0',reserved:'#ffcc00',sold:'#d32f2f'};
 const labels={unknown:'Da verificare',available:'Disponibile',reserved:'Prenotato',sold:'Venduto'};
 let sourceBytes=null,lastUrl=null;
 async function create(floorId,statuses,records={}){
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
  const native=page.getMediaBox(),rotation=((page.getRotation().angle%360)+360)%360;
  const box={x:0,y:0,width:rotation%180?native.height:native.width,height:rotation%180?native.width:native.height};
  const {pushGraphicsState,popGraphicsState,concatTransformationMatrix}=PDFLib;
  page.pushOperators(pushGraphicsState());
  if(rotation===90)page.pushOperators(concatTransformationMatrix(0,1,-1,0,native.x+native.width,native.y));
  else if(rotation===180)page.pushOperators(concatTransformationMatrix(-1,0,0,-1,native.x+native.width,native.y+native.height));
  else if(rotation===270)page.pushOperators(concatTransformationMatrix(0,-1,1,0,native.x,native.y+native.height));
  else page.pushOperators(concatTransformationMatrix(1,0,0,1,native.x,native.y));
  const counts={unknown:0,available:0,reserved:0,sold:0};
  for(const unit of MolassiRepository.forFloor(floorId)){
   const state=statuses[unit.id]??'unknown';if(!Object.hasOwn(colors,state))throw Error('Stato non valido.');counts[state]++;
   // Pre-scale X and Y independently; source MediaBox has a non-zero origin.
   let coordinate=0;
   const path=unit.path.replace(/-?\d+(?:\.\d+)?/g,n=>String(Number(n)*(coordinate++%2===0?box.width/2400:box.height/1698)));
   page.drawSvgPath(path,{x:box.x,y:box.y+box.height,color:color(colors[state]),opacity:state==='unknown'?0:.45,borderColor:color(colors[state]),borderOpacity:state==='unknown'?.45:.95,borderWidth:.65});
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
    page.drawRectangle({x,y:yy-1,width:7,height:7,color:color(colors[state]),opacity:state==='unknown'?0:.45,borderColor:color(colors[state]),borderWidth:.5,borderOpacity:1});
    page.drawText(label+' ('+counts[state]+')',{x:x+12,y:yy,size:6.5,font,color:ink});
   });
  }
  
  page.pushOperators(popGraphicsState());
  if(floor.mapped)await appendRegister(pdf,floor,statuses,records,font,bold,color);
  pdf.setTitle('Corte Molassi - '+floor.label.replace('−','-')+' - stati aggiornati');
  return pdf.save();
 }

 async function appendRegister(pdf,floor,statuses,records,font,bold,color){
  // Separate print pages keep every customer readable, even on dense cellar plans.
  const units=MolassiRepository.forFloor(floor.id).slice().sort((a,b)=>a.id.localeCompare(b.id,'it',{numeric:true}));
  const size=10,lineHeight=14,cols=[36,106,207,297],widths=[62,93,82,262];
  const ink=color('#22332e');let page,y,pageNumber=0;
  function measure(text){return font.widthOfTextAtSize([...text].map(ch=>{try{font.encodeText(ch);return ch}catch{return '?'}}).join(''),size)}
  function wrap(text,width){
   const lines=[];let line='';
   for(const ch of String(text||'Non indicato')){if(measure(line+ch)>width&&line){lines.push(line);line=''}line+=ch}
   lines.push(line);return lines;
  }
  async function draw(text,x,y){
   try{font.encodeText(text);page.drawText(text,{x,y,size,font,color:ink})}
   catch{
    // Unicode names unsupported by Helvetica retain their exact visible spelling.
    if(typeof document.createElement!=='function')throw Error('Il nome richiede un browser con supporto Unicode.');
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    ctx.font='40px sans-serif';const width=Math.ceil(ctx.measureText(text).width)+4;canvas.width=width;canvas.height=56;
    ctx.font='40px sans-serif';ctx.fillStyle='#22332e';ctx.textBaseline='alphabetic';ctx.fillText(text,0,42);
    const image=await pdf.embedPng(canvas.toDataURL('image/png'));page.drawImage(image,{x,y:y-3.5,width:width/4,height:14});
   }
  }
  function newPage(){
   page=pdf.addPage([595.28,841.89]);pageNumber++;
   page.drawText('CORTE MOLASSI',{x:36,y:798,size:18,font:bold,color:ink});
   page.drawText(floor.label.replace('−','-')+' - Schede commerciali',{x:36,y:774,size:12,font,color:ink});
   page.drawText('Riferimento: sigla unita sulla planimetria allegata',{x:36,y:755,size:9,font,color:ink});
   ['Unita','Stato','Venditore','Nome cliente'].forEach((text,i)=>page.drawText(text,{x:cols[i],y:726,size:10,font:bold,color:ink}));
   page.drawLine({start:{x:36,y:716},end:{x:559,y:716},thickness:1,color:ink});
   page.drawText('Riepilogo '+pageNumber+' - '+new Date().toLocaleDateString('it-IT'),{x:36,y:28,size:8,font,color:ink});
   y=699;
  }
  newPage();
  for(const u of units){
   const r=records[u.id]||{},state=statuses[u.id]||'unknown';
   const values=[u.id,labels[state],r.seller||'Non indicata',r.client||'Non indicato'];
   const lines=values.map((v,i)=>wrap(v,widths[i]));const height=Math.max(...lines.map(a=>a.length))*lineHeight+14;
   if(y-height<48)newPage();
   page.drawRectangle({x:36,y:y-height+9,width:523,height,color:color(colors[state]),opacity:state==='unknown'?.03:.08});
   for(let i=0;i<4;i++)for(let j=0;j<lines[i].length;j++)await draw(lines[i][j],cols[i]+2,y-j*lineHeight);
   page.drawLine({start:{x:36,y:y-height+9},end:{x:559,y:y-height+9},thickness:.3,color:color('#c8cfca')});
   y-=height;
  }
 }

 async function download(floor){
  const statuses=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.get(u.id)||'unknown']));
  const records=Object.fromEntries(MolassiRepository.units.map(u=>[u.id,MolassiState.record(u.id)]));
  const bytes=await create(floor,statuses,records);
  if(lastUrl)URL.revokeObjectURL(lastUrl);
  lastUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  let link=document.getElementById('pdf-download-ready');
  if(!link){link=document.createElement('a');link.id='pdf-download-ready';link.className='download-ready';document.getElementById('notice').after(link)}
  link.href=lastUrl;link.download='Corte-Molassi-'+floor+'-aggiornato.pdf';link.textContent='PDF pronto: fai clic qui per scaricarlo';link.hidden=false;link.click();
 }
 return {create,download};
})();
