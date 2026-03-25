const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcryptjs = require('bcryptjs');

const dbPath = process.env.DB_PATH
  ? process.env.DB_PATH
  : path.join(__dirname, '..', '..', 'campeggio.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore apertura database:', err);
  } else {
    console.log('✅ Database connesso:', dbPath);
  }
});

db.serialize(() => {

  // Crea tabelle
  db.run(`
    CREATE TABLE IF NOT EXISTS utenti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS piazzole (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      posizione_x REAL,
      posizione_y REAL,
      tipo TEXT DEFAULT 'standard'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prenotazioni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      piazzola_id INTEGER,
      nome_cliente TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      data_arrivo TEXT NOT NULL,
      data_partenza TEXT NOT NULL,
      pagato INTEGER DEFAULT 0,
      importo REAL DEFAULT 0,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (piazzola_id) REFERENCES piazzole(id)
    )
  `, () => {
    console.log('✅ Tabelle database verificate');

    // Crea utente admin se non esiste
    db.get('SELECT id FROM utenti WHERE username = ?', ['admin'], (err, row) => {
      if (!row) {
        bcryptjs.hash('password', 10, (err, hashedPassword) => {
          if (err) return console.error('Errore hash:', err);
          db.run(
            'INSERT INTO utenti (username, password, nome) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'Amministratore'],
            (err) => {
              if (err) console.error('Errore creazione admin:', err);
              else console.log('✅ Utente admin creato automaticamente (password: password)');
            }
          );
        });
      }
    });

    // Crea 20 piazzole se non esistono
    db.get('SELECT COUNT(*) as count FROM piazzole', (err, row) => {
      if (row && row.count === 0) {
        const piazzole = [];
        for (let i = 1; i <= 20; i++) {
          const col = (i - 1) % 5;
          const row = Math.floor((i - 1) / 5);
          piazzole.push({
            numero: i,
            posizione_x: 50 + col * 100,
            posizione_y: 50 + row * 100,
            tipo: 'standard'
          });
        }

        piazzole.forEach((p) => {
          db.run(
            'INSERT INTO piazzole (numero, posizione_x, posizione_y, tipo) VALUES (?, ?, ?, ?)',
            [p.numero, p.posizione_x, p.posizione_y, p.tipo],
            (err) => {
              if (err) console.error(`Errore piazzola ${p.numero}:`, err);
            }
          );
        });
        console.log('✅ 20 piazzole create automaticamente');
      }
    });
  });
});

module.exports = db;