const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+00:00',
});

// Tester la connexion au démarrage
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connecté avec succès');
    conn.release();
  } catch (err) {
    console.error('❌ Erreur connexion MySQL :', err.message);
    process.exit(1);
  }
})();

module.exports = pool;