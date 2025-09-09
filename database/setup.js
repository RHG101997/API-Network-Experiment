const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'experiments.db');
let db = null;

function setupDatabase() {
    return new Promise((resolve, reject) => {
        console.log('Setting up database...');
        
        db = new sqlite3.Database(dbPath);
        
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const seedSQL = fs.readFileSync(path.join(__dirname, 'seed-data.sql'), 'utf8');
        
        db.serialize(() => {
            db.exec(schemaSQL, (err) => {
                if (err) return reject(err);
                console.log('Schema created successfully');
                
                db.exec(seedSQL, (err) => {
                    if (err) return reject(err);
                    console.log('Sample data inserted successfully');
                    console.log('Database setup complete!');
                    resolve();
                });
            });
        });
    });
}

function getDatabase() {
    if (!db) {
        db = new sqlite3.Database(dbPath);
    }
    return db;
}

if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase, getDatabase };