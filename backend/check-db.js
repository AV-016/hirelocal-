const db = require('./db');

async function checkData() {
  try {
    console.log('--- RECENT USERS ---');
    const users = await db.query('SELECT name, email, role, pincode FROM users ORDER BY created_at DESC LIMIT 5');
    console.table(users.rows);

    console.log('\n--- RECENT BOOKINGS ---');
    const bookings = await db.query('SELECT id, status, scheduled_date FROM bookings ORDER BY created_at DESC LIMIT 5');
    console.table(bookings.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error checking database:', err);
    process.exit(1);
  }
}

checkData();
