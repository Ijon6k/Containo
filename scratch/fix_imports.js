const fs = require('fs');
const path = require('path');

const mappings = {
  '@/lib/logger': '@/lib/core/logger',
  './logger': './core/logger',
  '../logger': '../core/logger',
  '@/lib/auth': '@/lib/auth/index',
  './auth': './auth/index',
  '../auth': '../auth/index',
  '@/lib/auth-utils': '@/lib/auth/utils',
  './auth-utils': './auth/utils',
  '../auth-utils': '../auth/utils',
  '@/lib/cli-parser': '@/lib/services/cli-parser.service',
  './cli-parser': './services/cli-parser.service',
  '../cli-parser': '../services/cli-parser.service',
  '@/lib/statsTransformer': '@/lib/services/stats.service',
  './statsTransformer': './services/stats.service',
  '../statsTransformer': '../services/stats.service',
  '@/lib/actions': '@/lib/services/container-actions.service',
  './actions': './services/container-actions.service',
  '../actions': '../services/container-actions.service',
  '@/lib/network': '@/lib/utils/network',
  './network': './utils/network',
  '../network': '../utils/network',
  '@/lib/types': '@/lib/types', // index.ts handles it natively but some might import directly, wait, @/lib/types is fine.
  './types': './types/index',
  '../types': '../types/index',
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldImport, newImport] of Object.entries(mappings)) {
        // Regex to match exact import path in quotes
        const regex = new RegExp(`from ['"]${oldImport.replace(/\\./g, '\\.')}['"]`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `from '${newImport}'`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed imports in:', fullPath);
      }
    }
  }
}

['app', 'components', 'hooks', 'lib', 'snippet'].forEach(dir => {
  if (fs.existsSync(dir)) walkDir(dir);
});

// also server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');
let changedServer = false;
for (const [oldImport, newImport] of Object.entries(mappings)) {
  const regex = new RegExp(`from ['"]${oldImport.replace(/\\./g, '\\.')}['"]`, 'g');
  if (regex.test(serverContent)) {
    serverContent = serverContent.replace(regex, `from '${newImport}'`);
    changedServer = true;
  }
}
if (changedServer) fs.writeFileSync('server.ts', serverContent);
