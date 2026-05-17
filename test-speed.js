const Docker = require('dockerode');
const docker = new Docker();

async function run() {
  console.time('df');
  await docker.df();
  console.timeEnd('df');

  console.time('info');
  await docker.info();
  console.timeEnd('info');

  console.time('listContainers');
  await docker.listContainers({ all: true });
  console.timeEnd('listContainers');
}

run();
