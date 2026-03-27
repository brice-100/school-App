CREATE DATABASE IF NOT EXISTS school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_db;

-- 1. Salles
CREATE TABLE IF NOT EXISTS salles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  capacite INT DEFAULT 30
);

-- 2. Utilisateurs (Enseignants, Parents, Admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'parent') NOT NULL, -- 'admin' ajouté ici
  photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Classes
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  niveau VARCHAR(50),
  salle_id INT,
  teacher_id INT, -- L'enseignant principal de la classe
  FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE SET NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

USE school_db;

ALTER TABLE users ADD COLUMN statut ENUM('en_attente','actif','suspendu') NOT NULL DEFAULT 'en_attente' AFTER role;

UPDATE users SET statut = 'actif';

DESCRIBE users;

-- 4. Matières
CREATE TABLE IF NOT EXISTS matieres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
);

-- 5. Relation Enseignants <-> Matières
CREATE TABLE IF NOT EXISTS teacher_matieres (
  teacher_id INT,
  matiere_id INT,
  PRIMARY KEY (teacher_id, matiere_id),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE
);

-- 6. Élèves
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  photo VARCHAR(255),
  date_naissance DATE,
  classe_id INT,
  parent_id INT,
  FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

USE school_db;

-- ── Notes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  matiere_id    INT NOT NULL,
  teacher_id    INT NOT NULL,
  valeur        DECIMAL(5,2) NOT NULL,
  trimestre     TINYINT NOT NULL CHECK (trimestre IN (1,2,3)),
  annee_scolaire VARCHAR(10) NOT NULL DEFAULT '2024-2025',
  commentaire   TEXT,
  statut        ENUM('brouillon','valide') DEFAULT 'brouillon',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)  REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (matiere_id)  REFERENCES matieres(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id)  REFERENCES users(id)    ON DELETE CASCADE,
  UNIQUE KEY unique_note (student_id, matiere_id, trimestre, annee_scolaire)
);

-- ── Planning ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  classe_id   INT NOT NULL,
  matiere_id  INT NOT NULL,
  teacher_id  INT NOT NULL,
  jour        ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin   TIME NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classe_id)  REFERENCES classes(id)  ON DELETE CASCADE,
  FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)    ON DELETE CASCADE
);

-- ── Salaires ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salaires (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id  INT NOT NULL,
  montant     DECIMAL(10,2) NOT NULL,
  mois        VARCHAR(20) NOT NULL,
  annee       INT NOT NULL,
  statut      ENUM('paye','non_paye') DEFAULT 'non_paye',
  date_paiement DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_salaire (teacher_id, mois, annee)
);

CREATE TABLE IF NOT EXISTS paiements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  parent_id     INT NOT NULL,
  student_id    INT NOT NULL,
  montant_total DECIMAL(10,2) NOT NULL,
  montant_paye  DECIMAL(10,2) DEFAULT 0,
  recu_image    VARCHAR(255),
  statut        ENUM('en_attente','partiel','complet') DEFAULT 'en_attente',
  date_paiement DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id)  REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ── Notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  expediteur_id   INT,
  destinataire_id INT NOT NULL,
  sujet           VARCHAR(255),
  message         TEXT NOT NULL,
  lu              BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destinataire_id) REFERENCES users(id) ON DELETE CASCADE
);

SHOW TABLES;
DESCRIBE notifications;
 
SHOW TABLES;

INSERT INTO salles (nom, capacite) VALUES ('Salle A', 30), ('Salle B', 25),('Salle C', 30), ('Salle D', 25),('Salle E', 30), ('Salle F', 25);
INSERT INTO classes (nom, niveau, salle_id) VALUES ('CP', 'Primaire', 1), ('CE1', 'Primaire', 2),('SIL', 'Primaire', 3), ('CE2', 'Primaire', 4),('CM1', 'Primaire', 5), ('CM2', 'Primaire', 6);

USE school_db;
SHOW TABLES;
USE school_db;

ALTER TABLE users 
ADD COLUMN statut ENUM('en_attente', 'actif', 'suspendu') 
DEFAULT 'en_attente' 
AFTER role;

USE school_db;


select *from salles ;


SHOW COLUMNS FROM users;

USE school_db;
 

SHOW TABLES;
 


 
-- Vérifier la structure
DESCRIBE paiements;
 
-- Vérifier si des parents existent (nécessaire pour les paiements)
SELECT id, nom, prenom, role, statut FROM users WHERE role = 'parent';
 
-- Vérifier si des élèves existent
SELECT id, nom, prenom, parent_id FROM students;