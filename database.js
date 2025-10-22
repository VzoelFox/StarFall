const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

function init() {
    return new Promise((resolve, reject) => {
        console.log('Connecting to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                displayName TEXT,
                email TEXT UNIQUE
            )`, (err) => { if (err) reject(err); });

            db.run(`CREATE TABLE IF NOT EXISTS profiles (
                userId TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                description TEXT,
                profilePicture TEXT,
                template TEXT,
                zodiac TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`, (err) => { if (err) reject(err); });

            db.run(`CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT,
                title TEXT,
                url TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`, (err) => {
                if (err) reject(err);
                else {
                    console.log('Database initialized.');
                    resolve(db);
                }
            });
        });
    });
}

module.exports = { init, db };
