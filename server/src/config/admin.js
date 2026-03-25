require('dotenv').config();

const ADMIN = {
  id: 0,
  nom: 'Directeur',
  prenom: 'Principal',
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD, // comparé en clair (ou bcrypt au choix)
  role: 'admin',
};

module.exports = ADMIN;