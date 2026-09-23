const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=process.argv[2];
function boot(storage){const c={localStorage:storage};c.window=c;vm.createContext(c);for(const file of ['data/apartments.js','js/apartments.js','js/state.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);return c.MolassiState}
let value=null;const storage={getItem:()=>value,setItem:(k,v)=>{value=v}};
let s=boot(storage);assert.equal(s.get('A14'),null);assert.equal(s.get('C13'),'sold');
for(const status of ['available','reserved','sold',null]){assert.equal(s.set('A14',status),true);s=boot(storage);assert.equal(s.get('A14'),status)}
assert.throws(()=>s.set('A14','bad'));assert.throws(()=>s.set('FAKE','sold'));
value='{broken';s=boot(storage);assert.ok(s.warning);assert.equal(s.get('C13'),'sold');
s=boot({getItem:()=>null,setItem:()=>{throw Error('blocked')}});assert.equal(s.set('A14','sold'),false);assert.equal(s.get('A14'),null);assert.ok(s.warning);
value=JSON.stringify({version:1,units:{A14:'bad',FAKE:'sold',C13:null}});s=boot(storage);assert.equal(s.get('A14'),null);assert.equal(s.get('C13'),null);
console.log('PASS: source defaults, all states persisted on reload, invalid ids/states, corrupt JSON, blocked storage, validated overrides.');
