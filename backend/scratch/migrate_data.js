const { Client } = require('pg');

const localUrl = 'postgresql://postgres:newpassword123@localhost:5432/hirelocal';
const remoteUrl = 'postgresql://postgres.stfewvblufoporgganfz:%40Anushka016@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?options=-c%20search_path%3Dpublic';

async function migrate() {
  const local = new Client({ connectionString: localUrl });
  const remote = new Client({ connectionString: remoteUrl });

  try {
    await local.connect();
    await remote.connect();
    console.log('Connected to both databases.');

    // 1. Migrate Users
    const users = await local.query('SELECT * FROM users');
    console.log(`Found ${users.rows.length} users.`);
    for (const user of users.rows) {
      await remote.query(
        'INSERT INTO users (id, name, email, password_hash, phone, pincode, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [user.id, user.name, user.email, user.password_hash, user.phone, user.pincode, user.role, user.created_at]
      );
    }

    // 2. Migrate Worker Profiles
    const profiles = await local.query('SELECT * FROM worker_profiles');
    console.log(`Found ${profiles.rows.length} worker profiles.`);
    for (const p of profiles.rows) {
      await remote.query(
        'INSERT INTO worker_profiles (id, user_id, skill_category, experience_years, hourly_rate, bio, avg_rating, is_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [p.id, p.user_id, p.skill_category, p.experience_years, p.hourly_rate, p.bio, p.avg_rating, p.is_verified, p.created_at]
      );
    }

    // 3. Migrate Bookings
    const bookings = await local.query('SELECT * FROM bookings');
    console.log(`Found ${bookings.rows.length} bookings.`);
    for (const b of bookings.rows) {
      await remote.query(
        'INSERT INTO bookings (id, customer_id, worker_id, skill_required, description, scheduled_date, status, total_amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [b.id, b.customer_id, b.worker_id, b.skill_required, b.description, b.scheduled_date, b.status, b.total_amount, b.created_at]
      );
    }

    // 4. Migrate Reviews
    const reviews = await local.query('SELECT * FROM reviews');
    console.log(`Found ${reviews.rows.length} reviews.`);
    for (const r of reviews.rows) {
      await remote.query(
        'INSERT INTO reviews (id, booking_id, customer_id, worker_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [r.id, r.booking_id, r.customer_id, r.worker_id, r.rating, r.comment, r.created_at]
      );
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await local.end();
    await remote.end();
    process.exit(0);
  }
}

migrate();
