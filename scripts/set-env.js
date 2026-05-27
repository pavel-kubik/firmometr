const branch = process.env.CF_PAGES_BRANCH;
if (!branch) process.exit(0);

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/environments/environment.production.ts');
const content = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file, content.replace("branch: 'main'", `branch: '${branch}'`));
console.log(`set branch to '${branch}'`);
