import { Container } from '../types/index';

export const resolveContainerWebUrl = (c: Container) => {
  if (c.hostPorts.length === 0) return null;

  const first = c.hostPorts[0];
  const isHttps =
    first.container === 443 ||
    first.host === 443 ||
    first.container === 9443 ||
    first.host === 9443;
  return `${isHttps ? 'https' : 'http'}://localhost:${first.host}`;
};
