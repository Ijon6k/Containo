const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function check() {
  try {
    const df = await docker.df();
    console.log('DF Volumes:', JSON.stringify(df.Volumes, null, 2));
    console.log('DF Images:', JSON.stringify(df.Images.slice(0, 1), null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
