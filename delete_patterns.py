#!/usr/bin/env python3
"""
Eliminar patrones marcados para borrado.
Lee la lista de pendientes del navegador y borra los archivos.
"""

import json
import os
import shutil
from pathlib import Path

WEB_DIR = Path(__file__).parent
DATA_FILE = WEB_DIR / 'data.json'
PATTERNS_DIR = Path('D:/Natalia/Punto')
LOCAL_STORAGE_FILE = Path(os.path.expanduser('~')) / '.config' / 'natalia_patrones' / 'pending_deletions.json'

def get_pending_deletions():
    """Obtener IDs de patrones a borrar desde localStorage del navegador."""
    # Buscar en archivos de Chromium
    chrome_path = Path(os.path.expanduser('~')) / 'AppData' / 'Local' / 'Google' / 'Chrome' / 'User Data' / 'Default' / 'Local Storage' / 'leveldb'
    edge_path = Path(os.path.expanduser('~')) / 'AppData' / 'Local' / 'Microsoft' / 'Edge' / 'User Data' / 'Default' / 'Local Storage' / 'leveldb'
    
    pending = []
    
    # Buscar en Chrome
    for ldb_file in chrome_path.glob('*.ldb'):
        try:
            content = ldb_file.read_text(errors='ignore')
            if 'misPatrones_pendingDeletions' in content:
                # Extraer JSON del localStorage
                import re
                match = re.search(r'misPatrones_pendingDeletions.*?(\[[\d,\s]+\])', content)
                if match:
                    pending = json.loads(match.group(1))
                    break
        except:
            pass
    
    # Si no encontró en Chrome, intentar en Edge
    if not pending:
        for ldb_file in edge_path.glob('*.ldb'):
            try:
                content = ldb_file.read_text(errors='ignore')
                if 'misPatrones_pendingDeletions' in content:
                    import re
                    match = re.search(r'misPatrones_pendingDeletions.*?(\[[\d,\s]+\])', content)
                    if match:
                        pending = json.loads(match.group(1))
                        break
            except:
                pass
    
    return pending

def main():
    print("=== Eliminar patrones marcados ===\n")
    
    # Obtener pendientes
    pending = get_pending_deletions()
    
    if not pending:
        print("No hay patrones para borrar.")
        return
    
    print(f"Patrones a borrar: {len(pending)}")
    
    # Cargar data.json
    with open(DATA_FILE, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    deleted = 0
    for pattern_id in pending:
        pattern = next((p for p in data['patterns'] if p['id'] == pattern_id), None)
        if not pattern:
            continue
        
        designer = pattern['designer']
        filename = pattern['filename']
        
        # Borrar PDF
        pdf_path = PATTERNS_DIR / designer / filename
        if pdf_path.exists():
            pdf_path.unlink()
            print(f"  PDF borrado: {filename}")
        
        # Borrar imagen
        image_path = WEB_DIR / pattern.get('image', '')
        if image_path.exists():
            image_path.unlink()
            print(f"  Imagen borrada: {pattern.get('image', '')}")
        
        deleted += 1
    
    # Actualizar data.json
    data['patterns'] = [p for p in data['patterns'] if p['id'] not in pending]
    data['totalPatterns'] = len(data['patterns'])
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Limpiar localStorage del navegador
    # (El usuario debe hacerlo manualmente desde la web)
    
    print(f"\n{deleted} patrones eliminados.")
    print("Ejecuta publicar.bat para actualizar la web.")

if __name__ == '__main__':
    main()
