const mysql = require('mysql2/promise');

async function wipeFakeData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medicare_db'
    });

    console.log('Wiping fake hospital profiles...');
    await connection.query('TRUNCATE TABLE hospital_profiles');
    
    console.log('Done!');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

wipeFakeData();
