const db = require('./src/db/database');
const bcryptjs = require('bcryptjs');

// Cripta la password
bcryptjs.hash('password', 10, (err, hashedPassword) => {
  if (err) {
    console.error('Errore hash:', err);
    return;
  }

  // Inserisci l'utente nel database
  db.run(
    'INSERT INTO utenti (username, password, nome) VALUES (?, ?, ?)',
    ['admin', hashedPassword, 'Amministratore'],
    function(err) {
      if (err) {
        console.error('Errore inserimento:', err);
      } else {
        console.log('✅ Utente creato con successo!');
        console.log('Username: admin');
        console.log('Password: password');
      }
      db.close();
    }
  );
});