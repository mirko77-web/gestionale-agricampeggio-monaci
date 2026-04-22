const { createClient } = require('@libsql/client');
const bcryptjs = require('bcryptjs');

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
});

async function initDb() {
  // ======================
  // UTENTI
  // ======================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS utenti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ======================
  // PIAZZOLE
  // ======================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS piazzole (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      posizione_x REAL,
      posizione_y REAL,
      tipo TEXT DEFAULT 'standard'
    )
  `);

  // ======================
  // PRENOTAZIONI
  // ======================
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

  // ======================
  // ADMIN (crea solo se non esiste)
  // ======================
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
    console.log('✅ Utente admin creato');
  }

  // ======================
  // PIAZZOLE 1-30
  // Se il DB è vuoto le crea; se ne ha già meno di 30 aggiunge quelle mancanti
  // ======================
  const { rows: countRows } = await db.execute(
    'SELECT COUNT(*) as count FROM piazzole'
  );
  const count = Number(countRows[0].count);

  if (count < 30) {
    // Recupera i numeri già presenti per non creare duplicati
    const { rows: esistenti } = await db.execute('SELECT numero FROM piazzole');
    const numeriEsistenti = new Set(esistenti.map(r => r.numero));

    for (let i = 1; i <= 30; i++) {
      if (numeriEsistenti.has(i)) continue; // già presente, salta

      // Layout: 15 sinistra, 15 destra, 2 colonne
      const col = i <= 15 ? 0 : 1;
      const row = i <= 15 ? (i - 1) : (i - 16);

      await db.execute({
        sql: `INSERT INTO piazzole (numero, posizione_x, posizione_y, tipo) VALUES (?, ?, ?, ?)`,
        args: [i, 50 + col * 200, 50 + row * 80, 'standard']
      });
    }

    const aggiunte = 30 - count;
    console.log(`✅ ${aggiunte} piazzole aggiunte (totale: 30)`);
  } else {
    console.log(`ℹ️ Piazzole già presenti: ${count}`);
  }
}

initDb().catch(console.error);

module.exports = db;