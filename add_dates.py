import json
import os
from pathlib import Path
from datetime import datetime

pdf_dir = Path('D:/Natalia/Punto')
data_file = Path('D:/Natalia/web/data.json')

with open(data_file, 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

for pattern in data['patterns']:
    designer = pattern['designer']
    filename = pattern['filename']
    pdf_path = pdf_dir / designer / filename
    if pdf_path.exists():
        mtime = os.path.getmtime(pdf_path)
        pattern['date'] = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    else:
        pattern['date'] = ''

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Fechas agregadas a {len(data['patterns'])} patrones")
