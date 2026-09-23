"""Overlay SVG polygons on the original page, retaining its images and text."""
from io import BytesIO
from pathlib import Path
import json, re, math
from datetime import datetime
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

ROOT=Path(__file__).resolve().parent
LABELS={'unknown':'Da verificare','available':'Disponibile','reserved':'Riservato','sold':'Venduto'}
COLORS={'unknown':'#667a83','available':'#27845a','reserved':'#bd8417','sold':'#ac4a42'}

def make_path(c,d,w,h):
    tokens=re.findall(r'[MLZ]|-?\d+(?:\.\d+)?',d)
    p=c.beginPath();i=0
    while i<len(tokens):
        op=tokens[i];i+=1
        if op=='Z':p.close()
        elif op in ('M','L'):
            x,y=float(tokens[i])*w/2400,h-float(tokens[i+1])*h/1698;i+=2
            (p.moveTo if op=='M' else p.lineTo)(x,y)
        else:raise ValueError('Tracciato non valido')
    return p

def export_floor(floor_id,statuses):
    data=json.loads((ROOT/'data/apartments.json').read_text(encoding='utf-8'))
    floors={f['id']:f for f in data['floors']};units={u['id']:u for u in data['units']}
    if floor_id not in floors or not isinstance(statuses,dict):raise ValueError('Piano o stati non validi')
    if any(k not in units or not isinstance(v,str) or v not in LABELS for k,v in statuses.items()):raise ValueError('Stato non valido')
    f=floors[floor_id];reader=PdfReader(ROOT/data['source']);page=reader.pages[f['page']-1]
    w,h=float(page.mediabox.width),float(page.mediabox.height)
    buffer=BytesIO();c=canvas.Canvas(buffer,pagesize=(w,h));counts={s:0 for s in LABELS}
    for g in data['geometries']:
        if g['floor']!=floor_id:continue
        s=statuses.get(g['unitId'],units[g['unitId']]['status'] or 'unknown');counts[s]+=1
        p=make_path(c,g['path'],w,h)
        c.saveState();c.setStrokeColor(HexColor(COLORS[s]));c.setFillColor(HexColor(COLORS[s]))
        c.setLineWidth(.65);c.setFillAlpha(0 if s=='unknown' else .16);c.setStrokeAlpha(.45 if s=='unknown' else .95)
        c.drawPath(p,stroke=1,fill=int(s!='unknown'))
        if s=='sold':
            c.clipPath(p,stroke=0,fill=0);c.setStrokeAlpha(.7);c.setLineWidth(.8)
            dx=math.tan(math.radians(35))*h
            for x in range(-int(dx)-10,int(w)+10,8):c.line(x,0,x+dx,h)
        c.restoreState()
    # All ten originals leave this part of the left sidebar blank.
    x,y=w*35/1600,h*(1-785/1132)
    c.setFillColor(HexColor('#293b35'));c.setFont('Helvetica-Bold',8)
    c.drawString(x,y,'STATI CORRENTI' if f['mapped'] else 'TAVOLA ORIGINALE')
    c.setFont('Helvetica',6.5);c.drawString(x,y-12,datetime.now().strftime('Esportazione %d/%m/%Y %H:%M'))
    if f['mapped']:
        for i,(s,label) in enumerate(LABELS.items()):
            yy=y-25-i*11
            c.setStrokeColor(HexColor(COLORS[s]));c.setFillColor(HexColor(COLORS[s]))
            c.saveState();c.setFillAlpha(0 if s=='unknown' else .3);c.rect(x,yy-1,7,7,stroke=1,fill=1);c.restoreState()
            if s=='sold':c.line(x,yy,x+5,yy+6);c.line(x+3,yy,x+7,yy+5)
            c.setFillColor(HexColor('#293b35'));c.drawString(x+12,yy,label+' ('+str(counts[s])+')')
        c.drawString(x,y-80,'Le scritte della fonte restano visibili.')
        c.drawString(x,y-89,'La campitura indica lo stato corrente.')
    c.save();overlay=PdfReader(BytesIO(buffer.getvalue())).pages[0]
    page.merge_transformed_page(overlay,Transformation().translate(float(page.mediabox.left),float(page.mediabox.bottom)))
    writer=PdfWriter();writer.add_page(page)
    writer.add_metadata({'/Title':'Corte Molassi - '+f['label']+' - stati aggiornati','/Subject':'Planimetria originale con stati correnti delle unità'})
    output=BytesIO();writer.write(output);return output.getvalue()
