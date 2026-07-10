const db = require('./db');

async function migrate() {
  try {
    console.log('Adding new columns to team_members for doctor profiles...');
    await db.query(`
      ALTER TABLE team_members
      ADD COLUMN gender enum('Male','Female','Other') DEFAULT NULL,
      ADD COLUMN date_of_birth date DEFAULT NULL,
      ADD COLUMN medical_registration_number varchar(255) DEFAULT NULL,
      ADD COLUMN bio text DEFAULT NULL,
      ADD COLUMN languages_spoken varchar(255) DEFAULT NULL,
      ADD COLUMN areas_of_expertise text DEFAULT NULL
    `);
    console.log('Migration completed successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
