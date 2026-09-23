/* Bound to a Google Sheet. Run setup once, then deploy as a Web App. */
function setup() {
 const props=PropertiesService.getScriptProperties();
 props.setProperty('SHEET_ID',SpreadsheetApp.getActiveSpreadsheet().getId());
 if(!props.getProperty('PASSWORD'))props.setProperty('PASSWORD','0000');
 const book=SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
 const sheet=book.getSheetByName('Stati')||book.insertSheet('Stati');
 sheet.getRange(1,1,1,6).setValues([['Unita','Stato','Versione','Aggiornato','Venditore','Cliente']]);
}
function doPost(e) {
 let lock;
 try {
  const body=JSON.parse(e.postData.contents);
  const props=PropertiesService.getScriptProperties();
  if(!props.getProperty('PASSWORD')||body.password!==props.getProperty('PASSWORD'))throw Error('Password non corretta.');
  if(!['read','write'].includes(body.action))throw Error('Operazione non valida.');
  const cache=CacheService.getScriptCache(),cacheKey='molassi-state-v2';
  if(body.action==='read'){const hit=cache.get(cacheKey);if(hit)return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON)}
  lock=LockService.getScriptLock();lock.waitLock(10000);
  if(body.action==='read'){const hit=cache.get(cacheKey);if(hit)return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON)}
  const sheet=SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Stati');
  const rows=sheet.getDataRange().getValues().slice(1),units={};
  rows.forEach(row=>{if(row[0])units[row[0]]={status:row[1]||null,version:Number(row[2]),seller:readText_(row[4]),client:readText_(row[5])}});
  if(body.action==='write') {
   if(!UNIT_IDS.includes(body.id)||![null,'available','reserved','sold'].includes(body.status)||!Number.isInteger(body.version))throw Error('Stato o unità non valido.');
   const old=units[body.id];
   const seller=body.seller===undefined?(old?.seller||''):body.seller;
   const client=body.client===undefined?(old?.client||''):body.client;
   if(typeof seller!=='string'||typeof client!=='string'||seller.length>20||client.length>120||/[\x00-\x1f]/.test(seller+client))throw Error('Venditore o cliente non valido.');
   if((old?old.version:0)!==body.version)throw Error('Questa unità è stata modificata da un altro utente. Attendi l’aggiornamento e riprova.');
   const row=rows.findIndex(r=>r[0]===body.id),version=body.version+1;
   if(!props.getProperty('SCHEMA_V2_READY')){sheet.getRange(1,5,1,2).setValues([['Venditore','Cliente']]);props.setProperty('SCHEMA_V2_READY','yes')}
   sheet.getRange(row<0?sheet.getLastRow()+1:row+2,1,1,6).setValues([[body.id,body.status||'',version,new Date().toISOString(),writeText_(seller.trim()),writeText_(client.trim())]]);
   SpreadsheetApp.flush();units[body.id]={status:body.status,version,seller:seller.trim(),client:client.trim()};
  }
  const result={ok:true,schemaVersion:2,units};
  try{cache.put(cacheKey,JSON.stringify(result),5)}catch{cache.remove(cacheKey)}
  return json_(result);
 } catch(error){return json_({ok:false,error:error.message})}
 finally{if(lock&&lock.hasLock())lock.releaseLock()}
}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}

const UNIT_IDS=["A11", "A12", "A13", "A14", "A15", "A16", "AT1", "AT2", "AT3", "AT4", "AT5", "AT6", "AT7", "B11", "B12", "B13", "B14", "B21", "B22", "B23", "B24", "B31", "B32", "B33", "B34", "B41", "B42", "B43", "B44", "B51", "B52", "B53", "BT1", "BT2", "BT3", "BT4", "BT5", "BT6", "BX101", "BX102", "BX103", "BX104", "C11", "C12", "C13", "C14", "C15", "C21", "C22", "C23", "C24", "C25", "C31", "C32", "C33", "C34", "C41", "C42", "C43", "CA101", "CA102", "CA103", "CA105", "CA106", "CA107", "CA108", "CA109", "CA110", "CA111", "CA112", "CA113", "CA114", "CA115", "CA116", "CA117", "CA118", "CA119", "CA120", "CA121", "CA122", "CA123", "CA124", "CA125", "CA126", "CA127", "CA128", "CA129", "CA130", "CA131", "CA132", "CA133", "CA134", "CA135", "CA136", "CA137", "CA138", "CA139+140", "CA141", "CA142", "CA143", "CA144", "CA145", "CA146", "CA147", "CA148", "CA149", "CA150", "CA151", "CA152", "CA153", "CA154", "CA155", "CA156", "CA157", "CA158", "CA159", "CA160", "CA161", "CA162", "CA163", "CT1", "CT2", "CT3", "CT4", "CT5", "CT6", "MULINO", "PA101", "PA102", "PA103", "PA104", "PA105", "PA106", "PA107", "PA108", "PA109", "PA110", "PA111", "PA112", "PA113", "PA114", "PA115", "PA116", "PA117", "PA118", "PA119", "PA120", "PA121", "PA122", "PA123", "PA124", "PA125", "PA126", "PA127", "PA128", "PA129", "PA130", "PA131", "PA132", "PA201", "PA202", "PA203", "PA204", "PA205", "PA206", "PA207", "PA208", "PA209", "PA210", "PA211", "PA212", "PA213", "PA214", "PA215", "PA216", "PA217", "PA218", "PA219", "PA220", "PA221", "PA222", "PA223", "PA224", "PA225", "PA226", "PA227", "PA228", "PA229", "PA230", "PA231", "PA232", "PA233", "PA234", "PA235", "PA236", "PA237", "PA238", "PA239", "PA240", "PA241", "PA242", "PA243", "PA244", "PA245", "PA246", "PA247", "PA248", "PA249", "PA250"];

// Prefix persisted text to prevent spreadsheet formula interpretation.
function writeText_(value){return value?'text:'+value:''}
function readText_(value){const s=String(value||'');return s.startsWith('text:')?s.slice(5):s}
