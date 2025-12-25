const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const seedData = require('./seed'); // Import the seed function

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file)).toString();
      console.log(`Executing: ${file}`);
      await client.query(sql);
    }
    
    console.log("Migrations applied.");
    
    // Trigger Seeding
    await seedData(); 
    
  } catch (err) {
    console.error("Migration/Seed Error:", err);
    process.exit(1);
  } finally {
    client.release();
  }
};

module.exports = runMigrations;