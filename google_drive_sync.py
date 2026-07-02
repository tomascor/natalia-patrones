#!/usr/bin/env python3
"""
Sincronizar PDFs con Google Drive.
Uso: python google_drive_sync.py [--setup] [--upload] [--links]
"""

import os
import sys
import json
import pickle
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/drive.file']
WEB_DIR = Path(__file__).parent
PDF_DIR = WEB_DIR / 'pdfs'
CREDS_FILE = WEB_DIR / 'credentials.json'
TOKEN_FILE = WEB_DIR / 'token.pickle'
LINKS_FILE = WEB_DIR / 'drive_links.json'

def get_drive_service():
    """Obtener servicio autenticado de Google Drive."""
    creds = None
    
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_FILE.exists():
                print("ERROR: No se encontro credentials.json")
                print("Descargalo de Google Cloud Console y guardalo en:")
                print(f"  {CREDS_FILE}")
                sys.exit(1)
            
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    
    return build('drive', 'v3', credentials=creds)

def find_or_create_folder(service, name, parent_id=None):
    """Buscar o crear carpeta en Drive."""
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    
    if files:
        return files[0]['id']
    
    folder_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        folder_metadata['parents'] = [parent_id]
    
    folder = service.files().create(body=folder_metadata, fields='id').execute()
    return folder['id']

def upload_pdf(service, pdf_path, folder_id):
    """Subir un PDF a Google Drive y hacerlo público."""
    file_name = pdf_path.name
    
    file_metadata = {
        'name': file_name,
        'parents': [folder_id]
    }
    
    media = MediaFileUpload(
        str(pdf_path),
        mimetype='application/pdf',
        resumable=True
    )
    
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    
    file_id = file['id']
    
    # Hacer el archivo público
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(
        fileId=file_id,
        body=permission
    ).execute()
    
    return file_id

def sync_all():
    """Sincronizar todos los PDFs con Google Drive."""
    service = get_drive_service()
    
    # Crear carpeta raíz
    root_id = find_or_create_folder(service, 'Natalia Patrones')
    print(f"Carpeta raiz en Drive: {root_id}")
    
    links = {}
    
    if LINKS_FILE.exists():
        with open(LINKS_FILE, 'r', encoding='utf-8') as f:
            links = json.load(f)
    
    # Recorrer carpetas de diseñadores
    for designer_dir in sorted(PDF_DIR.iterdir()):
        if not designer_dir.is_dir():
            continue
        
        designer_name = designer_dir.name
        print(f"\nDiseñador: {designer_name}")
        
        # Crear carpeta del diseñador
        designer_folder_id = find_or_create_folder(service, designer_name, root_id)
        
        # Subir PDFs
        for pdf_file in sorted(designer_dir.glob('*.pdf')):
            pdf_key = f"{designer_name}/{pdf_file.name}"
            
            # Saltar si ya está subido
            if pdf_key in links and links[pdf_key].get('id'):
                print(f"  OK: {pdf_file.name}")
                continue
            
            print(f"  Subiendo: {pdf_file.name}...", end=' ')
            try:
                file_id = upload_pdf(service, pdf_file, designer_folder_id)
                links[pdf_key] = {
                    'id': file_id,
                    'url': f"https://drive.google.com/uc?export=download&id={file_id}"
                }
                print(f"OK ({file_id})")
                
                # Guardar progreso
                with open(LINKS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(links, f, indent=2, ensure_ascii=False)
                    
            except Exception as e:
                print(f"ERROR: {e}")
    
    # Guardar links finales
    with open(LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(links, f, indent=2, ensure_ascii=False)
    
    print(f"\n¡Listo! {len(links)} PDFs sincronizados con Google Drive")
    print(f"Links guardados en: {LINKS_FILE}")

def update_data_json():
    """Actualizar data.json con los links de Google Drive."""
    if not LINKS_FILE.exists():
        print("No se encontro drive_links.json. Ejecuta primero: python google_drive_sync.py --upload")
        return
    
    with open(LINKS_FILE, 'r', encoding='utf-8') as f:
        drive_links = json.load(f)
    
    data_file = WEB_DIR / 'data.json'
    if not data_file.exists():
        print("No se encontro data.json")
        return
    
    with open(data_file, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    updated = 0
    for pattern in data['patterns']:
        pdf_path = pattern.get('pdf', '')
        if pdf_path:
            # Quitar prefijo "pdfs/" para buscar en drive_links
            key = pdf_path.replace('pdfs/', '', 1) if pdf_path.startswith('pdfs/') else pdf_path
            if key in drive_links:
                pattern['downloadUrl'] = drive_links[key]['url']
                updated += 1
    
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"data.json actualizado: {updated} patrones con links de Drive")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Sincronizar PDFs con Google Drive')
    parser.add_argument('--upload', action='store_true', help='Subir PDFs a Google Drive')
    parser.add_argument('--links', action='store_true', help='Actualizar data.json con links')
    args = parser.parse_args()
    
    if args.upload:
        sync_all()
    elif args.links:
        update_data_json()
    else:
        sync_all()
        update_data_json()
