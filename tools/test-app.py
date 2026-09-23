"""HTTP security, inventory, export and preservation integration checks."""
import sys,json,re,hashlib
from pathlib import Path
from http.client import HTTPConnection
from io import BytesIO
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
port=int(sys.argv[1]) if len(sys.argv)>1 else 8766
out=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT/'test-output'
out.mkdir(parents=True,exist_ok=True)
cookie=''
def request(method,path,body=None,auth=True):
    c=HTTPConnection('127.0.0.1',port,timeout=60)
    headers={'Content-Type':'application/json'}
    if auth:headers['Cookie']=cookie
    c.request(method,path,body=json.dumps(body) if body is not None else None,headers=headers)
    r=c.getresponse();result=r.status,dict(r.getheaders()),r.read();c.close();return result
for path in ['/','/index.html','/assets/plans/p0.jpg','/data/apartments.js','/api/session']:
    assert request('GET',path,auth=False)[0] in (303,401),path
assert request('POST','/api/export/p0',{},auth=False)[0]==401
assert request('POST','/api/login',{'password':'wrong'})[0]==401
code,headers,_=request('POST','/api/login',{'password':'0000'})
assert code==200;cookie=headers['Set-Cookie'].split(';')[0]
assert 'HttpOnly' in headers['Set-Cookie'] and 'SameSite=Strict' in headers['Set-Cookie']
assert request('GET','/')[0]==200
assert request('GET','/serve.py')[0]==404
assert request('GET','/assets/plans/../../../serve.py')[0]==404
assert request('GET','/assets/plans/../../serve.py')[0]==404
assert request('GET','/assets/plans/..%2f..%2fserve.py')[0]==404
assert request('POST','/api/export/p0',{'statuses':{'FAKE':'sold'}})[0]==400
assert request('POST','/api/export/p0',{'statuses':{'AT1':[]}})[0]==400
data=json.loads((ROOT/'data/apartments.json').read_text(encoding='utf-8'))
assert len(data['units'])==209 and len(data['geometries'])==222
assert len({(g['floor'],g['unitId']) for g in data['geometries']})==222
source=PdfReader(ROOT/data['source'])
before=hashlib.sha256((ROOT/data['source']).read_bytes()).hexdigest()
statuses={u['id']:['available','reserved','sold','unknown'][i%4] for i,u in enumerate(data['units'])}
for f in data['floors']:
    code,headers,pdf=request('POST','/api/export/'+f['id'],{'statuses':statuses})
    assert code==200,(f['id'],pdf)
    assert headers['Content-Type']=='application/pdf'
    (out/(f['id']+'.pdf')).write_bytes(pdf)
    exported=PdfReader(BytesIO(pdf));assert len(exported.pages)==1
    page=exported.pages[0];original=source.pages[f['page']-1]
    assert list(page.mediabox)==list(original.mediabox)
    assert original.extract_text() in page.extract_text()
    assert len(page.images)==len(original.images)
    assert 'STATI CORRENTI' in page.extract_text() if f['mapped'] else 'TAVOLA ORIGINALE' in page.extract_text()
    # Export embeds original XObjects without re-rendering or downsampling.
    assert sorted(hashlib.sha256(i.data).hexdigest() for i in page.images)==sorted(hashlib.sha256(i.data).hexdigest() for i in original.images)
    print('PASS export',f['id'],len(pdf),flush=True)
assert hashlib.sha256((ROOT/data['source']).read_bytes()).hexdigest()==before
assert request('POST','/api/logout',{})[0]==200
assert request('GET','/api/session')[0]==401
assert request('POST','/api/export/p0',{})[0]==401
print('PASS authentication, logout, protected files, malformed input, all 10 exports, original text/images/page size retained.')
