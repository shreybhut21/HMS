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

    console.log('Adding new columns to patient_profiles table...');
    
    // Add columns, ignore error if they already exist (using try/catch for each or checking schema)
    const columns = [
      'ADD COLUMN profile_photo TEXT',
      'ADD COLUMN chronic_diseases TEXT',
      'ADD COLUMN current_medications TEXT',
      'ADD COLUMN past_surgeries TEXT'
    ];

    for (const col of columns) {
      try {
        await connection.query(`ALTER TABLE patient_profiles ${col}`);
        console.log(`Successfully added: ${col}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${col}`);
        } else {
          throw err;
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
