// Firebase Data Migration Script
// This script helps migrate product data from old Firebase to new Firebase

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration for source (old) Firebase
const sourceConfig = {
  // You'll paste your old Firebase service account key here
  serviceAccount: null, // Will be loaded from file
  databaseURL: "https://prassanas-orinut-default-rtdb.firebaseio.com" // Update this
};

// Configuration for destination (new) Firebase  
const destConfig = {
  // You'll paste your new Firebase service account key here
  serviceAccount: null, // Will be loaded from file
  databaseURL: "https://orinut-494cc-default-rtdb.firebaseio.com" // Update this
};

// Initialize Firebase Admin SDKs
let sourceApp, destApp;

const initializeFirebaseApps = () => {
  try {
    // Load service account keys from secure files
    const sourceServiceAccount = require('./old-firebase-key.json');
    const destServiceAccount = require('./new-firebase-key.json');
    
    // Initialize source Firebase app
    sourceApp = admin.initializeApp({
      credential: admin.credential.cert(sourceServiceAccount),
      databaseURL: sourceConfig.databaseURL
    }, 'source');
    
    // Initialize destination Firebase app
    destApp = admin.initializeApp({
      credential: admin.credential.cert(destServiceAccount),
      databaseURL: destConfig.databaseURL
    }, 'destination');
    
    console.log('✅ Firebase apps initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase apps:', error);
    return false;
  }
};

// Export data from source Firebase
const exportData = async () => {
  try {
    console.log('📤 Starting data export from source Firebase...');
    
    const sourceDb = admin.firestore(sourceApp);
    
    // Export products
    const productsSnapshot = await sourceDb.collection('products').get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${products.length} products`);
    
    // Export users (optional)
    const usersSnapshot = await sourceDb.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`👥 Found ${users.length} users`);
    
    // Export orders (optional)
    const ordersSnapshot = await sourceDb.collection('orders').get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`🛒 Found ${orders.length} orders`);
    
    // Save to backup file
    const backupData = {
      products,
      users,
      orders,
      exportDate: new Date().toISOString(),
      sourceProject: sourceConfig.databaseURL
    };
    
    fs.writeFileSync('./firebase-backup.json', JSON.stringify(backupData, null, 2));
    console.log('💾 Data exported to firebase-backup.json');
    
    return backupData;
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  }
};

// Import data to destination Firebase
const importData = async (data) => {
  try {
    console.log('📥 Starting data import to destination Firebase...');
    
    const destDb = admin.firestore(destApp);
    
    // Import products
    console.log(`📦 Importing ${data.products.length} products...`);
    for (const product of data.products) {
      const { id, ...productData } = product;
      await destDb.collection('products').doc(id).set(productData);
    }
    console.log('✅ Products imported successfully');
    
    // Import users (optional - be careful with user data)
    if (data.users && data.users.length > 0) {
      console.log(`👥 Importing ${data.users.length} users...`);
      for (const user of data.users) {
        const { id, ...userData } = user;
        await destDb.collection('users').doc(id).set(userData);
      }
      console.log('✅ Users imported successfully');
    }
    
    // Import orders (optional)
    if (data.orders && data.orders.length > 0) {
      console.log(`🛒 Importing ${data.orders.length} orders...`);
      for (const order of data.orders) {
        const { id, ...orderData } = order;
        await destDb.collection('orders').doc(id).set(orderData);
      }
      console.log('✅ Orders imported successfully');
    }
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
};

// Verify migration
const verifyMigration = async () => {
  try {
    console.log('🔍 Verifying migration...');
    
    const destDb = admin.firestore(destApp);
    
    // Check products count
    const productsSnapshot = await destDb.collection('products').get();
    console.log(`✅ Products in destination: ${productsSnapshot.size}`);
    
    // Check users count
    const usersSnapshot = await destDb.collection('users').get();
    console.log(`✅ Users in destination: ${usersSnapshot.size}`);
    
    // Check orders count
    const ordersSnapshot = await destDb.collection('orders').get();
    console.log(`✅ Orders in destination: ${ordersSnapshot.size}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    return false;
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting Firebase data migration...\n');
    
    // Initialize Firebase apps
    if (!initializeFirebaseApps()) {
      throw new Error('Failed to initialize Firebase apps');
    }
    
    // Export data from source
    const data = await exportData();
    
    console.log('\n📋 Migration Summary:');
    console.log(`   Products: ${data.products.length}`);
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Orders: ${data.orders.length}`);
    
    // Confirm before importing
    console.log('\n⚠️  Ready to import to destination Firebase.');
    console.log('   Make sure your destination Firebase is properly configured.');
    console.log('   This will overwrite any existing data with the same IDs.');
    
    // Import data to destination
    await importData(data);
    
    // Verify migration
    await verifyMigration();
    
    console.log('\n✨ Migration completed successfully!');
    console.log('   Your product data has been migrated to the new Firebase project.');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
};

// Export only products (if you only want to migrate products)
const exportProductsOnly = async () => {
  try {
    console.log('📤 Exporting products only...');
    
    if (!initializeFirebaseApps()) {
      throw new Error('Failed to initialize Firebase apps');
    }
    
    const sourceDb = admin.firestore(sourceApp);
    const productsSnapshot = await sourceDb.collection('products').get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${products.length} products`);
    
    // Save products to file
    fs.writeFileSync('./products-backup.json', JSON.stringify(products, null, 2));
    console.log('💾 Products exported to products-backup.json');
    
    return products;
  } catch (error) {
    console.error('❌ Error exporting products:', error);
    throw error;
  }
};

// Import products from backup file
const importProductsFromFile = async (filePath = './products-backup.json') => {
  try {
    console.log('📥 Importing products from backup file...');
    
    if (!initializeFirebaseApps()) {
      throw new Error('Failed to initialize Firebase apps');
    }
    
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const destDb = admin.firestore(destApp);
    
    console.log(`📦 Importing ${products.length} products...`);
    
    for (const product of products) {
      const { id, ...productData } = product;
      await destDb.collection('products').doc(id).set(productData);
      console.log(`✅ Imported: ${productData.name}`);
    }
    
    console.log('🎉 Products imported successfully!');
    
  } catch (error) {
    console.error('❌ Error importing products:', error);
    throw error;
  }
};

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'export':
    exportData();
    break;
  case 'import':
    const backupFile = process.argv[3] || './firebase-backup.json';
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      importData(data);
    } else {
      console.error('❌ Backup file not found:', backupFile);
    }
    break;
  case 'migrate':
    runMigration();
    break;
  case 'export-products':
    exportProductsOnly();
    break;
  case 'import-products':
    const productsFile = process.argv[3] || './products-backup.json';
    importProductsFromFile(productsFile);
    break;
  case 'verify':
    if (initializeFirebaseApps()) {
      verifyMigration();
    }
    break;
  default:
    console.log(`
🔥 Firebase Migration Tool

Usage:
  node firebase-migration.js [command]

Commands:
  export           Export all data from source Firebase
  import [file]    Import data to destination Firebase
  migrate          Full migration (export + import)
  export-products  Export only products
  import-products  Import only products
  verify           Verify destination Firebase data

Setup:
  1. Place your old Firebase service account key as 'old-firebase-key.json'
  2. Place your new Firebase service account key as 'new-firebase-key.json'
  3. Update the database URLs in the script
  4. Run: npm install firebase-admin
  5. Run migration command
    `);
}

module.exports = {
  runMigration,
  exportData,
  importData,
  exportProductsOnly,
  importProductsFromFile,
  verifyMigration
}; 