import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { targetPath, yamlContent } = await req.json();

    if (!targetPath) {
      return NextResponse.json({ error: 'Target path is required' }, { status: 400 });
    }

    // Jika pengguna melakukan deploy dari Visual Builder (yamlContent ada), buat folder dan tulis filenya
    if (yamlContent) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      const composeFile = path.join(targetPath, 'docker-compose.yml');
      fs.writeFileSync(composeFile, yamlContent, 'utf8');
    } else {
      // Jika dari Existing Stack, pastikan direktori dan file docker-compose ada
      if (!fs.existsSync(targetPath)) {
        return NextResponse.json({ error: 'Target directory does not exist' }, { status: 400 });
      }
      const hasYaml = fs.existsSync(path.join(targetPath, 'docker-compose.yml')) || 
                      fs.existsSync(path.join(targetPath, 'docker-compose.yaml'));
      
      if (!hasYaml) {
        return NextResponse.json({ error: 'No docker-compose.yml found in the selected directory' }, { status: 400 });
      }
    }

    // Eksekusi docker compose
    // PENTING: Gunakan 'docker compose' (plugin V2), fallback ke 'docker-compose' (V1) jika perlu
    const { stdout, stderr } = await execAsync('docker compose up -d', { cwd: targetPath });

    return NextResponse.json({ 
      success: true, 
      message: 'Stack deployed successfully',
      details: stdout || stderr
    });

  } catch (error: any) {
    // Tangkap error dari eksekusi CLI
    return NextResponse.json({ 
      error: 'Failed to deploy stack', 
      details: error.message || error.stderr 
    }, { status: 500 });
  }
}
