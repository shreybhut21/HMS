const mysql = require('mysql2/promise');

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medicare_db'
    });

    console.log('Creating hospital_profiles table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hospital_profiles (
        hospital_id INT PRIMARY KEY,
        address VARCHAR(255),
        doctor_name VARCHAR(100),
        degree VARCHAR(100),
        experience VARCHAR(50),
        description TEXT,
        image_url VARCHAR(255),
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating appointments table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        hospital_id INT,
        appointment_date DATE,
        appointment_time VARCHAR(20),
        problem_description TEXT,
        status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Seeding fake profiles for existing hospitals...');
    const [hospitals] = await connection.query('SELECT id FROM users WHERE type = "hospital"');
    
    const fakeData = [
      { doc: 'Dr. Sarah Wilson', deg: 'MD, Cardiology', exp: '15 Years', desc: 'A state-of-the-art facility specializing in cardiac care and general medicine.', img: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400' },
      { doc: 'Dr. James Chen', deg: 'MBBS, Neurology', exp: '12 Years', desc: 'Leading neurology center with advanced diagnostic equipment.', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' },
      { doc: 'Dr. Emily Brown', deg: 'DDS, Orthodontics', exp: '8 Years', desc: 'Comprehensive dental care and orthodontic treatments for all ages.', img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400' },
      { doc: 'Dr. Michael Davis', deg: 'MD, Pediatrics', exp: '20 Years', desc: 'Dedicated pediatric clinic ensuring the health and happiness of your children.', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400' }
    ];

    for (let i = 0; i < hospitals.length; i++) {
      const hId = hospitals[i].id;
      const data = fakeData[i % fakeData.length];
      
      const [existing] = await connection.query('SELECT hospital_id FROM hospital_profiles WHERE hospital_id = ?', [hId]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO hospital_profiles (hospital_id, address, doctor_name, degree, experience, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [hId, '123 Medical Way, City Center', data.doc, data.deg, data.exp, data.desc, data.img]
        );
      }
    }

    console.log('Migration completed successfully!');
    await connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
