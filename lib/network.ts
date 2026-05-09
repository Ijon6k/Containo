/**
 * Network and Port Utilities
 * Intelligent and dynamic port discovery for containers
 */
import { Container } from './types';

export const resolveContainerWebUrl = (c: Container) => {
  // 1. Handle Host Mode or Missing Bindings dynamically
  if (c.ports === 'Host Mode' || c.ports === 'N/A') {
    if (c.exposedPorts && c.exposedPorts.length > 0) {
      // Logic: Pick the most likely web port from exposed metadata
      // Netdata (19999), Portainer (9000), etc. will be in this list
      const priorityPorts = [19999, 9000, 8123, 3000, 80, 8080, 443];
      
      let bestPort = 0;
      for (const p of priorityPorts) {
        if (c.exposedPorts.includes(p)) {
          bestPort = p;
          break;
        }
      }
      
      const finalPort = bestPort || c.exposedPorts[0];
      const protocol = (finalPort === 443 || finalPort === 9443) ? 'https' : 'http';
      return `${protocol}://localhost:${finalPort}`;
    }
    return null;
  }

  // 2. Standard Port Bindings (mapped to host)
  const portPairs = c.ports.split(',').map(p => p.trim());
  
  if (portPairs.length > 0) {
    const priorityPorts = ['19999', '9443', '9000', '443', '80', '8080', '3000', '3001', '8123', '32400', '8096'];
    let bestPair = '';
    
    for (const p of priorityPorts) {
      const match = portPairs.find(pair => pair.includes(`:${p}`));
      if (match) {
        bestPair = match;
        break;
      }
    }
    
    const finalPair = bestPair || portPairs[0];
    const parts = finalPair.split(':');
    
    if (parts.length >= 2) {
      const hostPort = parts[0];
      const containerPort = parts[1];
      const protocol = (containerPort === '443' || hostPort === '443' || containerPort === '9443' || hostPort === '9443') ? 'https' : 'http';
      return `${protocol}://localhost:${hostPort}`;
    }
  }

  return null;
};
