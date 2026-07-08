const mysql = require('mysql2/promise');

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medicare_db',
      port: 3306
    });

    console.log('Creating patient_profiles table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patient_profiles (
        user_id INT PRIMARY KEY,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender ENUM('Male', 'Female', 'Other'),
        blood_group VARCHAR(10),
        height VARCHAR(20),
        weight VARCHAR(20),
        medical_history TEXT,
        allergies TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
