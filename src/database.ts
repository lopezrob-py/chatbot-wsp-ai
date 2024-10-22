import sqlite3 from 'sqlite3';

let db: sqlite3.Database;

export const initializeDatabase = async () => {
    db = new sqlite3.Database('./db/bot.db', async (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
          cedula TEXT PRIMARY KEY,
          nombre TEXT,
          apellido TEXT,
          fecha_nacimiento TEXT,
          situacion_laboral TEXT,
          telefono TEXT UNIQUE
        )
    `);

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
};

export const getDatabase = () => db;
