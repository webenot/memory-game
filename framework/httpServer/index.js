const cluster = require('cluster');
const os = require('os');

const pid = process.pid;
const count = os.cpus().length;

const workers = [];

console.log(`Master pid: ${pid}`);
console.log(`Starting ${count} forks`);

for (let i = 0; i < count; i++) {
  const worker = cluster.fork();
  console.log('Started worker:', worker.process.pid);
  workers.push(worker);
}

workers.forEach((worker, index) => {

  worker.send({ index });

  worker.on('exit', code => {
    console.log('Worker exited:', worker.process.pid, code);
    console.log('worker %d died (%s). restarting...', worker.process.pid, code);
    cluster.fork();
  });

  worker.on('message', message => {
    console.log('Message from worker', worker.process.pid);
    console.log(message);
  });

});
