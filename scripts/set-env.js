const fs = require('fs');
const path = require('path');

const branch = process.env.CF_PAGES_BRANCH;
const buildTime = new Date().toISOString();
const file = path.join(__dirname, '../src/environments/environment.production.ts');

let content = fs.readFileSync(file, 'utf8');
content = content.replace("buildTime: ''", `buildTime: '${buildTime}'`);
if (branch) content = content.replace("branch: 'main'", `branch: '${branch}'`);
fs.writeFileSync(file, content);

console.log(`build time: ${buildTime}${branch ? `, branch: ${branch}` : ''}`);
