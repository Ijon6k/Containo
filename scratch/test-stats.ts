import Docker from 'dockerode';
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function test() {
  const containers = await docker.listContainers();
  if (containers.length === 0) {
    console.log('No containers found');
    return;
  }

  const id = containers[0].Id;
  console.log(`Testing stats for ${id}...`);
  const container = docker.getContainer(id);
  const stream = await container.stats({ stream: true });

  stream.on('data', (chunk) => {
    console.log('--- CHUNK START ---');
    console.log(chunk.toString());
    console.log('--- CHUNK END ---');
  });

  setTimeout(() => {
    console.log('Closing stream...');
    (stream as any).destroy ? (stream as any).destroy() : (stream as any).end();
    process.exit(0);
  }, 5000);
}

test();
