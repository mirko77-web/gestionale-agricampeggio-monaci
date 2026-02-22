const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'campeggio.db'));

db.serialize(() => {
  // Tabella utenti (proprietario)
  db.run(`
    CREATE TABLE IF NOT EXISTS utenti (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      nome TEXT
    )
  `);

  // Tabella piazzole
  db.run(`
    CREATE TABLE IF NOT EXISTS piazzole (
      id INTEGER PRIMARY KEY,
      numero INTEGER UNIQUE,
      posizione_x REAL,
      posizione_y REAL,
      tipo TEXT
    )
  `);

  // Tabella prenotazioni
  db.run(`
    CREATE TABLE IF NOT EXISTS prenotazioni (
      id INTEGER PRIMARY KEY,
      piazzola_id INTEGER,
      nome_cliente TEXT,
      telefono TEXT,
      email TEXT,
      data_arrivo TEXT,
      data_partenza TEXT,
      pagato INTEGER,
      importo REAL,
      note TEXT,
      FOREIGN KEY(piazzola_id) REFERENCES piazzole(id)
    )
  `);
});

module.exports = db;