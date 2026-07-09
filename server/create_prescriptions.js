const mysql = require('mysql2/promise');

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medicare_db'
    });

    console.log('Connected to database.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prescription_uid VARCHAR(255) NOT NULL UNIQUE,
        hospital_id INT NOT NULL,
        patient_id INT NOT NULL,
        appointment_id INT,
        diagnosis VARCHAR(255) NOT NULL,
        advice TEXT,
        follow_up_date DATE,
        status ENUM('Active', 'Completed', 'Follow-Up Required') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
      )
    `);
    console.log('Table "prescriptions" created.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prescription_medicines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prescription_id INT NOT NULL,
        medicine_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        duration VARCHAR(255) NOT NULL,
        instructions TEXT,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "prescription_medicines" created.');

    await connection.end();
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

runMigration();
