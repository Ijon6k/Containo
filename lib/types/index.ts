export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited';
  ports: string;
  logs?: string[];
  networkMode?: string;
  exposedPorts?: number[];
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

export interface ServiceData {
  id: string;
  name: string;
  image: string;
  ports: string;
  env: string;
  volumes: string;
  restartPolicy: string;
  networkMode?: string;
  pidMode?: string;
  capAdd?: string[];
  securityOpt?: string[];
  privileged?: boolean;
}

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
