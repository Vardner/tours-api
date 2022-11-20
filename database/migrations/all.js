import {exec} from 'node:child_process';
import path from 'path';
import {fileURLToPath} from 'node:url';
import fs from 'fs/promises';

const filePath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filePath);
const fileName = path.basename(filePath);

const dirElements = await fs.readdir(__dirname, {withFileTypes: true, encoding: 'utf8'})


const migrationFiles = dirElements.filter(el => el.isFile() && el.name !== fileName);
const operation = process.env.operation === 'up' ? 'up' : 'down';

migrationFiles.forEach(file => {
    const fileName = file.name;

    exec('node ' + path.resolve(__dirname, fileName), {env: {operation: operation}}, (error, stdout, stderr) => {
        if (error) {
            console.error(`Migration ${fileName} ERROR: ${error}`);
            return;
        }
        if (stdout) {
            console.log(stdout);
        }

        if (stderr) {
            console.error(stderr);
        }
    });
});


