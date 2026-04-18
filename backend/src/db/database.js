const { createClient } = require('@libsql/client');
const bcryptjs = require('bcryptjs');

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
});

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS utenti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS piazzole (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      posizione_x REAL,
      posizione_y REAL,
      tipo TEXT DEFAULT 'standard'
    )
  `);

  await db.execute(`
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
  `);

  console.log('✅ Tabelle database verificate');

  // Crea admin se non esiste
  const { rows } = await db.execute({
    sql: 'SELECT id FROM utenti WHERE username = ?',
    args: ['admin']
  });
  if (rows.length === 0) {
    const hashedPassword = await bcryptjs.hash('password', 10);
    await db.execute({
      sql: 'INSERT INTO utenti (username, password, nome) VALUES (?, ?, ?)',
      args: ['admin', hashedPassword, 'Amministratore']
    });
    console.log('✅ Utente admin creato (password: password)');
  }

  // Crea 20 piazzole se non esistono
  const { rows: piazzoleRows } = await db.execute('SELECT COUNT(*) as count FROM piazzole');
  if (piazzoleRows[0].count === 0) {
    for (let i = 1; i <= 20; i++) {
      const col = (i - 1) % 5;
      const row = Math.floor((i - 1) / 5);
      await db.execute({
        sql: 'INSERT INTO piazzole (numero, posizione_x, posizione_y, tipo) VALUES (?, ?, ?, ?)',
        args: [i, 50 + col * 100, 50 + row * 100, 'standard']
      });
    }
    console.log('✅ 20 piazzole create automaticamente');
  }
}

initDb().catch(console.error);

module.exports = db;