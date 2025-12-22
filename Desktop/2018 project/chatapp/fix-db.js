const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔧 Adding missing columns to messages table...');
    
    // Add message_type column
    try {
      await connection.execute(`
        ALTER TABLE messages 
        ADD COLUMN message_type ENUM('text', 'image', 'file') DEFAULT 'text' AFTER is_read
      `);
      console.log('✅ Added message_type column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ message_type column already exists');
      } else {
        throw error;
      }
    }

    // Add updated_at column
    try {
      await connection.execute(`
        ALTER TABLE messages 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at
      `);
      console.log('✅ Added updated_at column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ updated_at column already exists');
      } else {
        throw error;
      }
    }

    console.log('\n📊 Updated messages table structure:');
    const [result] = await connection.execute('DESCRIBE messages');
    result.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'} ${row.Key ? `[${row.Key}]` : ''}`);
    });

    await connection.end();
    console.log('\n🎉 Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDatabase();