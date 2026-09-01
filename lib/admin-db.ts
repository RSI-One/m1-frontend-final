import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'admin-db.json');

interface AdminDb {
  listings: any[];
  approvals: any[];
  users: any[];
}

export function getDb(): AdminDb {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data) as AdminDb;
  } catch (error) {
    console.error('Error reading db.json', error);
    return { listings: [], approvals: [], users: [] };
  }
}

export function saveDb(data: AdminDb): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json', error);
  }
}