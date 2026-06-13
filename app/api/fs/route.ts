import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  let defaultPath = os.homedir();
  if (fs.existsSync('/host')) {
    const hostHome = path.join('/host', defaultPath);
    if (fs.existsSync(hostHome)) {
      defaultPath = hostHome;
    } else {
      defaultPath = '/host';
    }
  }

  let targetPath = searchParams.get('path');
  if (!targetPath || targetPath === 'undefined') {
    targetPath = defaultPath;
  }
  
  if (targetPath === '/' && fs.existsSync('/host')) {
    targetPath = '/host';
  }

  try {
    // Keamanan dasar: Pastikan direktori ada dan valid
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
    }

    const stat = fs.statSync(targetPath);
    if (!stat.isDirectory()) {
      return NextResponse.json({ error: 'Path is not a directory' }, { status: 400 });
    }

    // Baca isi direktori
    const items = fs.readdirSync(targetPath, { withFileTypes: true });
    
    const formattedItems = items
      .filter(item => {
        // Abaikan file sistem / hidden files jika perlu (opsional)
        if (item.name.startsWith('.')) return false;
        // Hanya tampilkan direktori atau file docker-compose
        return item.isDirectory() || item.name.includes('docker-compose');
      })
      .map(item => ({
        name: item.name,
        path: path.join(targetPath, item.name),
        isDirectory: item.isDirectory()
      }))
      .sort((a, b) => {
        // Direktori di atas, file di bawah
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ 
      currentPath: targetPath, 
      parentPath: targetPath === '/' ? '/' : path.dirname(targetPath),
      items: formattedItems 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
