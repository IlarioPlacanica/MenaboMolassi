from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
d=json.loads((r/'data/apartments.json').read_text(encoding='utf8'))
(r/'data/apartments.js').write_text('window.MOLASSI_DATA = '+json.dumps(d,ensure_ascii=False)+';\n',encoding='utf8')
