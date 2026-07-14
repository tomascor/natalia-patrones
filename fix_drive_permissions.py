#!/usr/bin/env python3
"""
Fix Drive Permissions - Establece permisos publicos en PDFs de Google Drive.
Uso: python fix_drive_permissions.py
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

SCOPES = ['https://www.googleapis.com/auth/drive']
WEB_DIR = Path(__file__).parent
CREDS_FILE = WEB_DIR / 'credentials.json'
TOKEN_FILE = WEB_DIR / 'token.pickle'
LINKS_FILE = WEB_DIR / 'drive_links.json'
ROOT_FOLDER_NAME = 'Natalia Patrones'


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
                sys.exit(1)

            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)

    return build('drive', 'v3', credentials=creds)


def find_folder(service, name, parent_id=None):
    """Buscar carpeta por nombre en Drive."""
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    return files[0]['id'] if files else None


def list_files_in_folder(service, folder_id):
    """Listar todos los archivos (PDFs) en una carpeta y subcarpetas."""
    all_files = []

    # Listar contenido de la carpeta
    query = f"'{folder_id}' in parents and trashed=false"
    page_token = None

    while True:
        results = service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, mimeType)",
            pageToken=page_token
        ).execute()

        for item in results.get('files', []):
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                # Es subcarpeta (diseñador), recursar
                sub_files = list_files_in_folder(service, item['id'])
                for sf in sub_files:
                    # Agregar prefijo de subcarpeta
                    sf['path'] = f"{item['name']}/{sf['name']}"
                all_files.extend(sub_files)
            elif item['name'].lower().endswith('.pdf'):
                item['path'] = item['name']
                all_files.append(item)

        page_token = results.get('nextPageToken')
        if not page_token:
            break

    return all_files


def set_public_permission(service, file_id):
    """Establecer permiso publico (cualquiera con el enlace puede leer)."""
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(
        fileId=file_id,
        body=permission
    ).execute()


def main():
    print("=" * 50)
    print("  FIX DRIVE PERMISSIONS")
    print("  Estableciendo permisos publicos en PDFs")
    print("=" * 50)
    print()

    # 1. Autenticar
    print("[1/4] Conectando con Google Drive...")
    service = get_drive_service()
    print("  OK: Autenticado")
    print()

    # 2. Buscar carpeta raiz
    print("[2/4] Buscando carpeta '{}'...".format(ROOT_FOLDER_NAME))
    root_id = find_folder(service, ROOT_FOLDER_NAME)
    if not root_id:
        print("  ERROR: No se encontro la carpeta '{}'".format(ROOT_FOLDER_NAME))
        print("  Verifica que exista en tu Google Drive")
        sys.exit(1)
    print("  OK: Carpeta encontrada ({})".format(root_id))
    print()

    # 3. Listar todos los PDFs
    print("[3/4] Listando PDFs...")
    pdfs = list_files_in_folder(service, root_id)
    print("  Encontrados: {} PDFs".format(len(pdfs)))
    print()

    # 4. Establecer permisos
    print("[4/4] Estableciendo permisos publicos...")
    links = {}
    success = 0
    errors = 0

    for i, pdf in enumerate(pdfs, 1):
        path = pdf['path']
        file_id = pdf['id']
        print("  [{}/{}] {}...".format(i, len(pdfs), path[:60]), end=' ')

        try:
            set_public_permission(service, file_id)
            url = "https://drive.google.com/uc?export=download&id={}".format(file_id)
            links[path] = {
                'id': file_id,
                'url': url
            }
            print("OK")
            success += 1
        except Exception as e:
            print("ERROR: {}".format(e))
            errors += 1

    print()
    print("=" * 50)
    print("  RESULTADO: {} exitosos, {} errores".format(success, errors))
    print("=" * 50)
    print()

    # Guardar links
    if links:
        with open(LINKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(links, f, indent=2, ensure_ascii=False)
        print("Links guardados en: {}".format(LINKS_FILE))
        print("Total: {} archivos con permisos publicos".format(len(links)))
    else:
        print("No se guardaron links (hubo errores)")

    print()
    print("Siguiente paso: python google_drive_sync.py --links")


if __name__ == '__main__':
    main()
