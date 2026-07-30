import { Container } from '../types/index';

export interface PortItem {
  raw: string;
  isHostExposed: boolean;
  url?: string;
  hostPort?: number;
}

export const getPortUrl = (hostPort: number, containerPort?: number) => {
  const isHttps =
    containerPort === 443 ||
    hostPort === 443 ||
    containerPort === 9443 ||
    hostPort === 9443;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `${isHttps ? 'https' : 'http'}://${host}:${hostPort}`;
};

export const resolveContainerWebUrl = (c: Container) => {
  if (c.hostPorts.length === 0) return null;

  const first = c.hostPorts[0];
  return getPortUrl(first.host, first.container);
};

export const parseContainerPorts = (c: Container): PortItem[] => {
  if (!c.ports || c.ports === 'N/A' || c.ports === '—' || c.ports === 'Host Mode') {
    return [];
  }

  const parts = c.ports.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    const match = part.match(/^(\d+):(\d+)$/);
    if (match) {
      const hostPort = parseInt(match[1], 10);
      const containerPort = parseInt(match[2], 10);
      return {
        raw: part,
        isHostExposed: true,
        url: getPortUrl(hostPort, containerPort),
        hostPort,
      };
    }

    const bound = c.hostPorts?.find(
      (bp) => `${bp.host}:${bp.container}` === part || bp.host.toString() === part
    );
    if (bound) {
      return {
        raw: part,
        isHostExposed: true,
        url: getPortUrl(bound.host, bound.container),
        hostPort: bound.host,
      };
    }

    return {
      raw: part,
      isHostExposed: false,
    };
  });
};
