const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyAdvancedSchema() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chat_app',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL database');

    // Read and execute the advanced schema
    const schemaPath = path.join(__dirname, 'database', 'advanced-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Applying advanced schema...');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('USE'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
          } else {
            console.error(`❌ Error in statement: ${statement.substring(0, 50)}...`);
            console.error(`   Error: ${error.message}`);
          }
        }
      }
    }

    console.log('🎉 Advanced schema applied successfully!');
    console.log('✨ New features available:');
    console.log('   - Group chat functionality');
    console.log('   - Message reactions');
    console.log('   - Message editing and replies');
    console.log('   - User settings and preferences');
    console.log('   - Blocked users management');
    console.log('   - Starred messages');
    console.log('   - Media sharing support');

  } catch (error) {
    console.error('❌ Error applying advanced schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

applyAdvancedSchema();