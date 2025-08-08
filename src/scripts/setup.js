#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔥 Firebase Migration Setup\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js detected: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check for service account keys
console.log('\n🔑 Checking for service account keys...');

const oldKeyExists = fs.existsSync('./old-firebase-key.json');
const newKeyExists = fs.existsSync('./new-firebase-key.json');

if (!oldKeyExists) {
  console.log('⚠️  Missing: old-firebase-key.json');
  console.log('   Please download your old Firebase service account key and save it as "old-firebase-key.json"');
}

if (!newKeyExists) {
  console.log('⚠️  Missing: new-firebase-key.json');
  console.log('   Please download your new Firebase service account key and save it as "new-firebase-key.json"');
}

if (oldKeyExists && newKeyExists) {
  console.log('✅ Both service account keys found');
} else {
  console.log('\n📋 To get your service account keys:');
  console.log('   1. Go to https://console.firebase.google.com/');
  console.log('   2. Select your project');
  console.log('   3. Go to Project Settings → Service Accounts');
  console.log('   4. Click "Generate new private key"');
  console.log('   5. Save the downloaded file in this directory');
}

// Check migration script configuration
console.log('\n⚙️  Checking migration script configuration...');

const migrationScript = fs.readFileSync('./firebase-migration.js', 'utf8');

if (migrationScript.includes('your-old-project.firebaseio.com')) {
  console.log('⚠️  Please update the old Firebase project URL in firebase-migration.js');
  console.log('   Line ~10: Update databaseURL with your old project ID');
}

if (migrationScript.includes('your-new-project.firebaseio.com')) {
  console.log('⚠️  Please update the new Firebase project URL in firebase-migration.js');
  console.log('   Line ~16: Update databaseURL with your new project ID');
}

// Create example configuration if needed
console.log('\n📝 Creating example configuration...');

const exampleConfig = `
// Example Firebase Configuration
// Replace these with your actual Firebase project URLs

// Old Firebase Project
const OLD_PROJECT_ID = "your-old-project-id";
const OLD_DATABASE_URL = \`https://\${OLD_PROJECT_ID}.firebaseio.com\`;

// New Firebase Project  
const NEW_PROJECT_ID = "your-new-project-id";
const NEW_DATABASE_URL = \`https://\${NEW_PROJECT_ID}.firebaseio.com\`;

// Update these in firebase-migration.js:
// Line ~10: databaseURL: OLD_DATABASE_URL
// Line ~16: databaseURL: NEW_DATABASE_URL
`;

fs.writeFileSync('./example-config.txt', exampleConfig);
console.log('✅ Created example-config.txt for reference');

// Security reminder
console.log('\n🛡️  Security Reminders:');
console.log('   ✓ Service account keys are in .gitignore');
console.log('   ✓ Never commit private keys to version control');
console.log('   ✓ Delete keys after migration is complete');
console.log('   ✓ Test migration with a small dataset first');

// Next steps
console.log('\n🚀 Next Steps:');
console.log('   1. Place your Firebase service account keys in this directory');
console.log('   2. Update the project URLs in firebase-migration.js');
console.log('   3. Run: npm run migrate (for full migration)');
console.log('   4. Or run: npm run export-products (for products only)');

console.log('\n📖 For detailed instructions, see: MIGRATION_GUIDE.md');

// Check if ready to migrate
if (oldKeyExists && newKeyExists) {
  console.log('\n🎯 Ready to migrate! Available commands:');
  console.log('   npm run migrate          - Full migration');
  console.log('   npm run export-products  - Export products only');
  console.log('   npm run import-products  - Import products only');
  console.log('   npm run verify           - Verify migration');
  console.log('   npm run help             - Show all options');
} else {
  console.log('\n❗ Please add your service account keys before running migration');
}

console.log('\n✨ Setup complete! Happy migrating! 🔥'); 