const mysql = require('mysql2/promise');

async function migrateTeam() {
  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medicare_db',
      port: 3306
    });

    console.log('Modifying users table to support staff roles...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY type ENUM('patient', 'hospital', 'admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'manager') NOT NULL
    `);

    console.log('Creating team_members table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        user_id INT PRIMARY KEY,
        hospital_id INT NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        profile_photo TEXT,
        specialization VARCHAR(255),
        qualification VARCHAR(255),
        experience VARCHAR(50),
        consultation_fee DECIMAL(10,2),
        working_days VARCHAR(255),
        available_time VARCHAR(255),
        shift_timing VARCHAR(255),
        department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Team members migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during team migration:', error);
    process.exit(1);
  }
}

migrateTeam();
