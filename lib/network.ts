/**
 * Network and Port Utilities
 */
import { Container } from './types';

export const resolveContainerWebUrl = (c: Container) => {
  const portPairs = c.ports && c.ports !== 'Host Mode' && c.ports !== 'N/A' 
    ? c.ports.split(',').map(p => p.trim()) 
    : [];
  
  if (portPairs.length > 0) {
    const priorityPorts = ['9443', '9000', '443', '80', '8080', '3000'];
    let bestPair = '';
    
    for (const p of priorityPorts) {
      const match = portPairs.find(pair => pair.endsWith(`:${p}`));
      if (match) {
        bestPair = match;
        break;
      }
    }
    
    const finalPair = bestPair || portPairs[0];
    const [hostPort, containerPort] = finalPair.split(':');
    const protocol = (containerPort === '443' || hostPort === '443' || containerPort === '9443' || hostPort === '9443') ? 'https' : 'http';
    
    return `${protocol}://localhost:${hostPort}`;
  }

  return null;
};
