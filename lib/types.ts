export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited';
  ports: string;
  logs: string[];
}

export interface Volume {
  id: string;
  name: string;
  size: string;
  driver: string;
  mountpoint: string;
  createdAt: string;
  lastBackup: string;
}

export type View = 'dashboard' | 'maintenance' | 'backup' | 'settings';

export interface ContainerStats {
  id: string;
  cpuPercentage: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  memoryPercentage: number;
  networkRxMB: number;
  networkTxMB: number;
  blockReadMB: number;
  blockWriteMB: number;
}
