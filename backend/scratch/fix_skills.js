const db = require('../db');

async function fix() {
  try {
    const res = await db.query(
      "UPDATE worker_profiles SET skill_category = 'Electrician' WHERE skill_category = 'Painter'"
    );
    console.log(`Updated ${res.rowCount} worker profiles to Electrician.`);
  } catch (err) {
    console.error('Error fixing skills:', err);
  } finally {
    process.exit(0);
  }
}

fix();
