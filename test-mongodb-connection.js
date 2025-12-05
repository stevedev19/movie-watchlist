// Quick MongoDB connection test
const mongoose = require('mongoose');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    const match = envFile.match(/MONGODB_URI=(.+)/);
    if (match) {
      MONGODB_URI = match[1].trim();
    }
  } catch (error) {
    console.error('❌ Could not read .env.local file');
    process.exit(1);
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    console.log('🗄️  Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    console.log('📝 Collections:', Object.keys(mongoose.connection.collections).length, 'collections found');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('💡 Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Check your MongoDB cluster URL');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check your internet connection and MongoDB network access');
    }
    process.exit(1);
  });
