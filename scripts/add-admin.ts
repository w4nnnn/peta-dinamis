import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('❌ Penggunaan: npm run add-admin <username> <password>');
    console.error('   Contoh: npm run add-admin admin password123');
    process.exit(1);
}

const [username, password] = args;

// Validate input
if (username.length < 3) {
    console.error('❌ Username harus minimal 3 karakter');
    process.exit(1);
}

if (password.length < 6) {
    console.error('❌ Password harus minimal 6 karakter');
    process.exit(1);
}

async function addAdmin() {
    try {
        // Connect to database
        const sqlite = new Database('sqlite.db');

        // Check if username already exists
        const existing = sqlite.prepare('SELECT id FROM admins WHERE username = ?').get(username);

        if (existing) {
            console.error(`❌ Username "${username}" sudah ada di database`);
            sqlite.close();
            process.exit(1);
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new admin
        const stmt = sqlite.prepare(
            'INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)'
        );

        const result = stmt.run(username, passwordHash, Date.now());

        console.log('✅ Admin berhasil ditambahkan!');
        console.log(`   Username: ${username}`);
        console.log(`   ID: ${result.lastInsertRowid}`);

        sqlite.close();
    } catch (error) {
        console.error('❌ Gagal menambahkan admin:', error);
        process.exit(1);
    }
}

addAdmin();
