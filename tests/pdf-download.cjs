const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function fixture(){
 const elements=new Map();
 const element=()=>({children:[],listeners:{},value:'',checked:false,style:{},dataset:{},classList:{remove(){}},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},setAttribute(){},addEventListener(event,fn){this.listeners[event]=fn},scrollTo(){},after(node){elements.set(node.id,node)},click(){this.clicked=true}});
 for(const [,id] of read('index.html').matchAll(/id="([^"]+)"/g))elements.set(id,element());
 const document={baseURI:'https://example.test/MenaboMolassi/',getElementById:id=>elements.get(id)||null,createElement:element,createElementNS:element,createTextNode:text=>text,querySelectorAll:()=>[],documentElement:element(),addEventListener(){}};
 let refreshes=0,downloads=0,subscriber;
 const state={ready:true,saving:false,warning:null,get:()=> 'available',record:()=>({version:1}),refresh(){refreshes++;return new Promise(()=>{})},start:async()=>{},subscribe(fn){subscriber=fn}};
 const context={document,location:{protocol:'https:'},console,setTimeout,clearTimeout,URL,Blob,TextDecoder,AbortSignal,MolassiAccess:{check:()=>true,isStatic:true},MolassiState:state,MolassiExport:{async download(progress){downloads++;progress('Preparazione: Piano 1…')}},addEventListener(){}};
 context.window=context;vm.createContext(context);
 const run=file=>vm.runInContext(read(file),context);
 run('data/apartments.js');run('js/apartments.js');run('js/app.js');
 return {context,state,elements,run,click:()=>elements.get('export-pdf').listeners.click(),refreshes:()=>refreshes,downloads:()=>downloads,notify:()=>subscriber()};
}

(async()=>{
 const ui=fixture();
 await ui.click();
 assert.equal(ui.refreshes(),0,'Export must not wait for an unresponsive Google read');
 assert.equal(ui.downloads(),1);
 assert.equal(ui.elements.get('export-pdf').disabled,false);
 ui.state.saving=true;await ui.click();assert.equal(ui.downloads(),1,'Do not export while a write is pending');
 ui.state.saving=false;ui.state.ready=false;await ui.click();assert.equal(ui.downloads(),1,'Require a confirmed initial snapshot');
 ui.state.ready=true;ui.state.warning='Sincronizzazione interrotta';await ui.click();
 assert.match(ui.elements.get('notice').textContent,/Sincronizzazione interrotta/);
 ui.context.MolassiExport.download=async()=>{throw Error('PDF originale non disponibile')};
 await ui.click();assert.equal(ui.elements.get('export-pdf').disabled,false);
 assert.match(ui.elements.get('notice').textContent,/PDF originale non disponibile/);

 const states=fixture();
 states.context.MolassiShared={request:async()=>({schemaVersion:2,units:{
  A11:{status:null,version:1},A12:{status:'reserved',version:2},A13:{status:'sold',version:3}
 }})};
 states.run('js/state.js');
 await states.context.MolassiState.refresh();
 assert.equal(states.context.MolassiState.get('A11'),'available');
 assert.equal(states.context.MolassiState.get('A12'),'reserved');
 assert.equal(states.context.MolassiState.get('A13'),'sold');
 for(const unit of states.context.MolassiRepository.units){
  if(!['A11','A12','A13'].includes(unit.id))assert.equal(states.context.MolassiState.get(unit.id),unit.status??'available');
 }

 const pdf=fixture();
 pdf.run('assets/vendor/pdf-lib.min.js');
 let blob;
 pdf.context.URL=class extends URL{static createObjectURL(value){blob=value;return 'blob:test'}static revokeObjectURL(){}};
 pdf.context.fetch=async()=>({ok:true,arrayBuffer:async()=>fs.readFileSync(path.join(root,pdf.context.MOLASSI_DATA.source))});
 pdf.run('js/export.js');
 const progress=[];
 await pdf.context.MolassiExport.download(value=>progress.push(value));
 const link=pdf.elements.get('pdf-download-ready');
 assert.equal(link.href,'blob:test');assert.equal(link.hidden,false);assert.equal(link.clicked,true);
 assert.equal(link.download,'Corte-Molassi-tutti-i-piani-aggiornato.pdf');
 assert.equal(progress.length,10);
 const document=await require('../assets/vendor/pdf-lib.min.js').PDFDocument.load(await blob.arrayBuffer());
 assert.equal(document.getPageCount(),10,'Only the original plans are included, with no summary pages');
 pdf.context.PDFLib=null;
 await assert.rejects(()=>pdf.context.MolassiExport.createAll({}),/Libreria PDF non caricata/);
 console.log('PASS: unresponsive Google, pending save, missing snapshot, sync warning, export failure, manual download link, and complete 10-page PDF.');
})().catch(error=>{console.error(error);process.exitCode=1});
