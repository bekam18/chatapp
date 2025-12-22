const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🚀 Setting up MySQL database for Chat App...\n');
  
  try {
    // Read environment variables
    require('dotenv').config();
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    };

    console.log(`Connecting to MySQL at ${dbConfig.host}...`);
    
    // Connect to MySQL (without specifying database)
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to MySQL successfully!');
    
    // Create database
    console.log('📝 Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS chat_app');
    await connection.query('USE chat_app');
    
    // Create tables one by one
    console.log('📝 Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(150) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          status ENUM('online', 'offline') DEFAULT 'offline',
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_status (status)
      )
    `);
    
    console.log('📝 Creating messages table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          message_type ENUM('text', 'image', 'file') DEFAULT 'text',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_sender_receiver (sender_id, receiver_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_read (is_read)
      )
    `);
    
    console.log('📝 Creating conversations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user1_id INT NOT NULL,
          user2_id INT NOT NULL,
          last_message_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL,
          INDEX idx_users (user1_id, user2_id)
      )
    `);
    
    // Test the connection to the new database
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\n📊 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now run: npm run dev:full');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Please check your MySQL credentials in the .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Please make sure MySQL server is running');
    }
    
    process.exit(1);
  }
}

setupDatabase();