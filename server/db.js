import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || 'db.sqlite';
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expiry INTEGER,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    stripe_status TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Safe migrations - add name column if not exists
try {
  db.exec("ALTER TABLE users ADD COLUMN name TEXT;");
} catch (e) {
  // Column already exists, ignore error
}

// Seed default users if users table is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('Seeding default demo users (user@shipkit.dev and admin@shipkit.dev)...');
  const salt = bcrypt.genSaltSync(10);
  const hashedUserPassword = bcrypt.hashSync('password123', salt);
  
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, is_verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'seed-user-uuid-1111',
    'Default User',
    'user@shipkit.dev',
    hashedUserPassword,
    'user',
    1,
    Date.now()
  );

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, is_verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'seed-admin-uuid-2222',
    'Default Admin',
    'admin@shipkit.dev',
    hashedUserPassword,
    'admin',
    1,
    Date.now()
  );
  console.log('Seeding completed successfully.');
}

// Seed default system settings if table is empty
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get().count;
if (settingsCount === 0) {
  console.log('Seeding default system settings...');
  db.prepare("INSERT INTO system_settings (key, value) VALUES ('app_name', 'ShipKit')").run();
  db.prepare("INSERT INTO system_settings (key, value) VALUES ('support_email', 'support@shipkit.dev')").run();
  db.prepare("INSERT INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')").run();
  console.log('System settings seeded successfully.');
}

console.log(`Database initialized successfully at: ${dbPath}`);

export default db;
