# Core Types

All types defined in `lib/types/index.ts`.

## Container

```typescript
interface Container {
  id: string;                    // Docker container ID (first 12 chars)
  name: string;                  // Container name (stripped of leading /)
  image: string;                 // Docker image name:tag
  status: 'running' | 'exited';  // Binary state
  ports: string;                 // Formatted port string
                                 //   Bound: "80:80" (host:container)
                                 //   Internal: "service:port" (no host binding)
                                 //   IPv4/IPv6 duplicates are de-duplicated
  logs?: string[];               // Container logs (loaded on demand)
  networkMode?: string;          // Docker network mode (default, host, bridge, etc.)
  hostPorts: Array<{ host: number; container: number }>;  // Ports bound to host
  internalPorts: number[];       // Ports only exposed internally (no host binding)
  composeProject?: string;       // compose project name (from labels)
  composeConfig?: string;        // compose config file path (from labels)
  composeWorkingDir?: string;    // compose working directory (from labels)
}
```

## Volume

```typescript
interface Volume {
  id: string;           // Docker volume ID
  name: string;         // Volume name
  size: string;         // Human-readable size
  driver: string;       // Volume driver (local, nfs, etc.)
  mountpoint: string;   // Host mount path
  createdAt: string;    // Creation timestamp
  lastBackup: string;   // Last backup timestamp
}
```

## ServiceData

Used for Docker Compose service definition in UI:

```typescript
interface ServiceData {
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
```

## ContainerStats

Real-time metrics for a single container:

```typescript
interface ContainerStats {
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
```

## Derived / Aggregated Types

### SystemInfo (not a TypeScript interface, constructed at runtime)

Built in `broadcaster.ts` → `broadcastSystemInfo()`:

```typescript
{
  timestamp: number;
  healthScore: number;        // 0-100
  healthBreakdown: { stability, hygiene, resources };
  cpuUsage: number;           // Host CPU %
  memUsage: number;           // Host RAM %
  dockerCpu: number;          // Aggregate Docker CPU
  dockerMem: number;          // Aggregate Docker RAM
  imagesCount: number;
  containerStats: { total, running, stopped, crashes };
  storage: { hostTotal, hostFree, dockerBytes, imagesBytes, volumesBytes, imagesGB, volumesGB };
  dockerInfo: { name, serverVersion, cpus, memTotal };
}
```

## Relationship Map

```
Container ◄── Referenced by: ContainerStats, ContainerCard, useContainers
Volume ◄──── Referenced by: VolumeList, useBackupRestore
ServiceData ◄ Referenced by: ComposeBuilder, ServiceCard
```
