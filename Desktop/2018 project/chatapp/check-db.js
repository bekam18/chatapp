const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('📊 Messages table structure:');
    const [result] = await connection.execute('DESCRIBE messages');
    result.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'} ${row.Key ? `[${row.Key}]` : ''}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();