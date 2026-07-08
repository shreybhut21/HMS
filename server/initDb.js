const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL (XAMPP default)...');
    // Connect to MySQL server without selecting a DB first
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Default XAMPP password is empty
      port: 3306
    });

    console.log('Creating database if it does not exist...');
    await connection.query('CREATE DATABASE IF NOT EXISTS medicare_db');
    await connection.query('USE medicare_db');

    console.log('Dropping existing tables to start clean...');
    await connection.query('DROP TABLE IF EXISTS pending_hospitals');
    await connection.query('DROP TABLE IF EXISTS users');

    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        type ENUM('patient', 'hospital', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating pending_hospitals table...');
    await connection.query(`
      CREATE TABLE pending_hospitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert the default admin account
    console.log('Inserting default admin account...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Shreybhut21@', salt);
    
    await connection.query(`
      INSERT INTO users (name, email, password, type) 
      VALUES (?, ?, ?, ?)
    `, ['Shrey', 'admin@medicare.com', hashedPassword, 'admin']);

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
