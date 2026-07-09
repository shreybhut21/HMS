const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medicare_db'
  });

  try {
    console.log('Adding token_number to appointments...');
    try {
      await connection.query(`ALTER TABLE appointments ADD COLUMN token_number INT DEFAULT NULL`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('token_number column already exists.');
    }

    console.log('Creating hospital_queues table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hospital_queues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hospital_id INT,
        queue_date DATE,
        current_token INT DEFAULT 0,
        last_issued_token INT DEFAULT 0,
        UNIQUE KEY hospital_date (hospital_id, queue_date),
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration 3 completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
