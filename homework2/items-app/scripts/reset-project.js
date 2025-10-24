const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

console.log('🧹 Cleaning up the project...');

// Remove node_modules
if (fs.existsSync(path.join(projectRoot, 'node_modules'))) {
  console.log('📦 Removing node_modules...');
  execSync('rm -rf node_modules', { cwd: projectRoot, stdio: 'inherit' });
}

// Remove .expo
if (fs.existsSync(path.join(projectRoot, '.expo'))) {
  console.log('🗑️  Removing .expo...');
  execSync('rm -rf .expo', { cwd: projectRoot, stdio: 'inherit' });
}

console.log('✨ Project cleaned up!');
console.log('📝 Run "npm install" to reinstall dependencies.');
