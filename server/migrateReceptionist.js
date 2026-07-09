const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medicare_db'
  });

  try {
    console.log('1. Updating appointments table...');
    try {
      await connection.query(`ALTER TABLE appointments ADD COLUMN doctor_id INT DEFAULT NULL`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('doctor_id column already exists in appointments.');
    }

    console.log('2. Updating hospital_queues table...');
    try {
      // It might throw if the index doesn't exist, we can ignore it
      await connection.query(`ALTER TABLE hospital_queues DROP INDEX hospital_date`);
    } catch (err) {
      console.log('hospital_date index not found or already dropped.');
    }
    
    try {
      await connection.query(`ALTER TABLE hospital_queues ADD COLUMN doctor_id INT DEFAULT NULL`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('doctor_id column already exists in hospital_queues.');
    }
    
    try {
      await connection.query(`ALTER TABLE hospital_queues ADD UNIQUE KEY hospital_doctor_date (hospital_id, doctor_id, queue_date)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('hospital_doctor_date index already exists.');
    }

    console.log('3. Creating invoices table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE,
        hospital_id INT NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT,
        consultation_fee DECIMAL(10,2) DEFAULT 0,
        additional_charges DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('Pending', 'Paid') DEFAULT 'Pending',
        payment_method VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Receptionist Backend Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
