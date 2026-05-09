/**
 * MODULE: Docker Command Parser
 * FUNCTION: Menkonversi perintah "docker run" menjadi Service Schema
 */

export interface ServiceSchema {
  name: string;
  image: string;
  ports: string[];
  volumes: string[];
}

export const parseDockerCommand = (command: string): ServiceSchema => {
  const parts = command.trim().split(/\s+/);
  const schema: ServiceSchema = {
    name: '',
    image: '',
    ports: [],
    volumes: []
  };

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Deteksi Parameter Nama
    if (part === '--name' && parts[i + 1]) schema.name = parts[++i];
    
    // Deteksi Pemetaan Port
    if (part === '-p' && parts[i + 1]) schema.ports.push(parts[++i]);
    
    // Deteksi Volume Mounting
    if (part === '-v' && parts[i + 1]) schema.volumes.push(parts[++i]);
  }

  // Identifikasi Image (biasanya argumen terakhir tanpa prefix '-')
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!parts[i].startsWith('-') && !['docker', 'run', '-d'].includes(parts[i])) {
      schema.image = parts[i];
      break;
    }
  }

  return schema;
};
