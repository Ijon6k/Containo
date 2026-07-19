export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited';
  ports: string;
  logs?: string[];
  networkMode?: string;
  hostPorts: Array<{ host: number; container: number }>;
  internalPorts: number[];
  composeProject?: string;
  composeConfig?: string;
  composeWorkingDir?: string;
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
  command?: string;
  labels?: string;
  capAdd?: string[];
  securityOpt?: string[];
  privileged?: boolean;
  depends_on?: string;
  networks?: string;
  buildContext?: string;
  dockerfile?: string;
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
