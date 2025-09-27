/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { spawn } = require('child_process');

console.log('Static MachineID:', process.env.MACHINE_ID);

// Get the service name from command-line arguments (default to 'gateway')
const SERVICE_NAME = process.env.SERVICE_NAME || 'gateway';

// Function to execute a Node.js process with specified stack size and signal forwarding
function runNodeProcess(filePath) {
  console.log(`Starting service: ${SERVICE_NAME} from ${filePath}`);
  const nodeProcess = spawn('node', ['--stack-size=4096', filePath], {
    stdio: 'inherit', // Inherit stdio to show output in console
  });

  // Handle SIGTERM in parent and forward to child
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Forwarding to child...`);
    nodeProcess.kill(signal);
  };

  process.on('SIGTERM', shutdown);

  nodeProcess.on('error', (error) => {
    console.error(`Failed to start process: ${error.message}`);
    process.exit(1);
  });

  nodeProcess.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    process.exit(code || 0);
  });

  // Also listen for child close to clean up handlers
  nodeProcess.on('close', (code) => {
    process.removeListener('SIGTERM', shutdown);
    process.exit(code || 0);
  });
}

// Main logic
if (SERVICE_NAME === 'gateway') {
  const gatewayPath = path.join(__dirname, '../dist/apps/gateway/main.js');
  if (fs.existsSync(gatewayPath)) {
    runNodeProcess(gatewayPath);
  } else {
    console.error('Gateway service not found...!');
    process.exit(1);
  }
} else if (SERVICE_NAME === 'services') {
  const servicesPath = path.join(__dirname, '../dist/apps/services/main.js');
  if (fs.existsSync(servicesPath)) {
    runNodeProcess(servicesPath);
  } else {
    console.error('Services service not found...!');
    process.exit(1);
  }
} else if (SERVICE_NAME === 'workers') {
  const workersPath = path.join(__dirname, '../dist/apps/workers/main.js');
  if (fs.existsSync(workersPath)) {
    runNodeProcess(workersPath);
  } else {
    console.error('Workers service not found...!');
    process.exit(1);
  }
} else {
  console.error('Service or Worker not found...!');
  process.exit(1);
}
