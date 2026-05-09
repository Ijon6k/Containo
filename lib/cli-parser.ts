import { ServiceData } from './types';

/**
 * Ultra Robust Docker CLI Parser
 * Handles:
 * - Flags with space or equals (--network host or --network=host)
 * - Multiple occurrences (--cap-add SYS_ADMIN --cap-add SYS_PTRACE)
 * - Complex volumes with options (-v /var/run:/var/run:ro,rslave)
 * - Quoted values
 */
export const parseDockerCommand = (command: string): ServiceData => {
  const result: ServiceData = {
    id: 'cli-' + Date.now(),
    name: '',
    image: '',
    ports: '',
    env: '',
    volumes: '',
    restartPolicy: 'unless-stopped',
    networkMode: '',
    pidMode: '',
    capAdd: [],
    securityOpt: [],
    privileged: false
  };

  // 1. Clean backslashes and unify spaces
  let cleanCmd = command.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 2. Tokenize by space but keep quoted strings together
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < cleanCmd.length; i++) {
    const char = cleanCmd[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ' ' && !inQuotes) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);

  // 3. Process tokens
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    let key = part;
    let value = '';

    // Handle --key=value format
    if (part.startsWith('-') && part.includes('=')) {
      const index = part.indexOf('=');
      key = part.substring(0, index);
      value = part.substring(index + 1);
    } else if (part.startsWith('-')) {
      key = part;
      value = (parts[i + 1] && !parts[i + 1].startsWith('-')) ? parts[i + 1] : '';
      if (value) i++; // Consume the value
    } else {
      continue; // Skip non-flag parts for now
    }

    // Map keys to result
    switch (key) {
      case '--name':
        result.name = value;
        break;
      case '-p':
      case '--publish':
        result.ports = result.ports ? `${result.ports}, ${value}` : value;
        break;
      case '-v':
      case '--volume':
        result.volumes = result.volumes ? `${result.volumes}\n${value}` : value;
        break;
      case '-e':
      case '--env':
        result.env = result.env ? `${result.env}\n${value}` : value;
        break;
      case '--restart':
        result.restartPolicy = value;
        break;
      case '--network':
      case '--net':
        result.networkMode = value;
        break;
      case '--pid':
        result.pidMode = value;
        break;
      case '--privileged':
        result.privileged = true;
        break;
      case '--cap-add':
        if (value) result.capAdd!.push(value);
        break;
      case '--security-opt':
        if (value) result.securityOpt!.push(value);
        break;
    }
  }

  // 4. Identify Image (The first non-flag part after 'run' that isn't a flag value)
  const valueFlags = ['-p', '--publish', '-v', '--volume', '-e', '--env', '--name', '--restart', '--network', '--net', '--pid', '--cap-add', '--security-opt'];
  
  const imageIndex = parts.findIndex((p, idx) => {
    if (idx === 0) return false;
    if (p === 'docker' || p === 'run' || p === '-d' || p === '-it' || p === '--rm') return false;
    if (p.startsWith('-')) return false;
    
    // Check previous part
    const prev = parts[idx-1];
    // If previous was a flag without '=', then current might be its value
    if (valueFlags.includes(prev) && !prev.includes('=')) return false;
    
    return true;
  });

  if (imageIndex !== -1) {
    result.image = parts[imageIndex];
  }

  if (!result.name) {
    const imgBase = result.image.split('/').pop()?.split(':')[0] || 'manual-deploy';
    result.name = imgBase;
  }

  return result;
};
