const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/piazzole', require('./src/routes/piazzole'));
app.use('/api/prenotazioni', require('./src/routes/prenotazioni'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));