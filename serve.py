"""Local authenticated app: python serve.py [--port 8765]."""
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from http.cookies import SimpleCookie
from urllib.parse import urlsplit,unquote
from pathlib import Path
import argparse,hmac,json,mimetypes,os,secrets,time,threading,socket
from pdf_export import export_floor
ROOT=Path(__file__).resolve().parent
PASSWORD=os.environ.get('MOLASSI_PASSWORD','0000')
SESSIONS={};LOCK=threading.Lock();SESSION_SECONDS=8*60*60
SOURCE='2026 08 27_Corte Molassi_Complessivo Piani.pdf'
PUBLIC={'/login.html','/css/style.css','/js/login.js'}
APP_FILES={'/','/index.html','/'+SOURCE,'/data/apartments.js','/js/apartments.js','/js/state.js','/js/app.js','/js/export.js'}

class Handler(BaseHTTPRequestHandler):
    def reply(self,code,body=b'',kind='application/json; charset=utf-8',extra=None,head=False):
        self.send_response(code);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','same-origin')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
        for k,v in (extra or {}).items():self.send_header(k,v)
        self.end_headers()
        if not head:self.wfile.write(body)
    def token(self):
        try:
            cookie=SimpleCookie(self.headers.get('Cookie',''));return cookie['molassi_session'].value if 'molassi_session' in cookie else ''
        except Exception:return ''
    def authenticated(self):
        now=time.time()
        with LOCK:
            for k,v in list(SESSIONS.items()):
                if v<now:SESSIONS.pop(k,None)
            return SESSIONS.get(self.token(),0)>now
    def do_HEAD(self):self.get(head=True)
    def do_GET(self):self.get()
    def get(self,head=False):
        path=unquote(urlsplit(self.path).path)
        if path not in PUBLIC and not self.authenticated():
            if path.startswith('/api/'):self.reply(401,b'{"error":"Accesso richiesto"}',head=head)
            else:self.reply(303,extra={'Location':'/login.html'},head=head)
            return
        if path=='/api/session':self.reply(200,b'{"authenticated":true}',head=head);return
        file=(ROOT/('index.html' if path=='/' else path.lstrip('/'))).resolve()
        plan_asset=path.startswith('/assets/plans/') and file.is_relative_to(ROOT/'assets/plans') and file.suffix.lower() in ('.png','.jpg','.jpeg')
        valid=path in PUBLIC or path in APP_FILES or plan_asset
        if not valid or not file.is_relative_to(ROOT) or not file.is_file():self.reply(404,b'{"error":"Non trovato"}',head=head);return
        self.reply(200,file.read_bytes(),mimetypes.guess_type(str(file))[0] or 'application/octet-stream',head=head)
    def do_POST(self):
        origin=self.headers.get('Origin')
        if origin and origin!='http://'+self.headers.get('Host',''):self.reply(403,b'{"error":"Origine non consentita"}');return
        if self.headers.get_content_type()!='application/json':self.reply(415,b'{"error":"JSON richiesto"}');return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if size<0 or size>65536:raise ValueError()
            body=json.loads(self.rfile.read(size))
            if not isinstance(body,dict):raise ValueError()
        except (ValueError,UnicodeDecodeError):self.reply(400,b'{"error":"Richiesta non valida"}');return
        path=urlsplit(self.path).path
        if path=='/api/login':
            pw=body.get('password')
            if not isinstance(pw,str) or not hmac.compare_digest(pw.encode(),PASSWORD.encode()):self.reply(401,b'{"error":"Password non corretta"}');return
            token=secrets.token_urlsafe(32)
            with LOCK:
                SESSIONS.pop(self.token(),None);SESSIONS[token]=time.time()+SESSION_SECONDS
            self.reply(200,b'{"ok":true}',extra={'Set-Cookie':'molassi_session='+token+'; HttpOnly; SameSite=Strict; Path=/'});return
        if not self.authenticated():self.reply(401,b'{"error":"Accesso richiesto"}');return
        if path=='/api/logout':
            with LOCK:SESSIONS.pop(self.token(),None)
            self.reply(200,b'{"ok":true}',extra={'Set-Cookie':'molassi_session=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/'});return
        if path.startswith('/api/export/'):
            floor=path.rsplit('/',1)[-1]
            try:pdf=export_floor(floor,body.get('statuses',{}))
            except ValueError:self.reply(400,b'{"error":"Piano o stati non validi"}');return
            except Exception:
                self.log_error('PDF export failed');self.reply(500,b'{"error":"Esportazione non riuscita. Verifica il PDF originale e le dipendenze."}');return
            self.reply(200,pdf,'application/pdf',{'Content-Disposition':'attachment; filename="Corte-Molassi-'+floor+'-aggiornato.pdf"'});return
        self.reply(404,b'{"error":"Non trovato"}')

class MolassiServer(ThreadingHTTPServer):
    allow_reuse_address=False
    def server_bind(self):
        if os.name=='nt':self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
        super().server_bind()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    server=MolassiServer(('127.0.0.1',args.port),Handler)
    print('Corte Molassi: http://127.0.0.1:'+str(args.port),flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:server.server_close()
