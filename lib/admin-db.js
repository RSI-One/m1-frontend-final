import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'admin-db.json');

export function getDb() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json', error);
    return { listings: [], approvals: [], users: [] };
  }
}

export function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json', error);
  }
}