const db           = require('../config/db')
const asyncHandler = require('../utils/asyncHandler')

// ── Vue d'ensemble ───────────────────────────────────────────────
const getOverview = asyncHandler(async (req, res) => {
  const [[students]]  = await db.execute("SELECT COUNT(*) AS total FROM students")
  const [[teachers]]  = await db.execute(
    "SELECT COUNT(*) AS total FROM users WHERE role='teacher' AND statut='actif'"
  )
  const [[parents]]   = await db.execute(
    "SELECT COUNT(*) AS total FROM users WHERE role='parent' AND statut='actif'"
  )
  const [[classes]]   = await db.execute("SELECT COUNT(*) AS total FROM classes")
  const [[pending]]   = await db.execute(
    "SELECT COUNT(*) AS total FROM users WHERE statut='en_attente'"
  )
  const [[payments]]  = await db.execute(`
    SELECT
      COALESCE(SUM(montant_total), 0) AS total_attendu,
      COALESCE(SUM(montant_paye),  0) AS total_paye
    FROM paiements
  `)
  const [[notes]]     = await db.execute(`
    SELECT
      COUNT(*)                                          AS total_notes,
      COALESCE(ROUND(AVG(valeur), 2), 0)               AS moyenne_generale,
      SUM(CASE WHEN valeur >= 10 THEN 1 ELSE 0 END)    AS nb_admis,
      SUM(CASE WHEN valeur  < 10 THEN 1 ELSE 0 END)    AS nb_echec
    FROM notes WHERE statut = 'valide'
  `)

  const taux_collecte = payments.total_attendu > 0
    ? Math.round((payments.total_paye / payments.total_attendu) * 100)
    : 0

  const taux_reussite = (notes.nb_admis + notes.nb_echec) > 0
    ? Math.round((notes.nb_admis / (notes.nb_admis + notes.nb_echec)) * 100)
    : 0

  res.json({
    success: true,
    data: {
      students:         students.total,
      teachers:         teachers.total,
      parents:          parents.total,
      classes:          classes.total,
      pending_accounts: pending.total,
      total_attendu:    payments.total_attendu,
      total_paye:       payments.total_paye,
      taux_collecte,
      moyenne_generale: notes.moyenne_generale,
      taux_reussite,
      nb_admis:         notes.nb_admis  || 0,
      nb_echec:         notes.nb_echec  || 0,
    },
  })
})

// ── Notes par classe ─────────────────────────────────────────────
const getNotesByClasse = asyncHandler(async (req, res) => {
  const { annee_scolaire = '2024-2025', trimestre } = req.query

  let query = `
    SELECT
      c.nom                                            AS classe,
      COUNT(n.id)                                      AS total_notes,
      COALESCE(ROUND(AVG(n.valeur), 2), 0)            AS moyenne,
      SUM(CASE WHEN n.valeur >= 10 THEN 1 ELSE 0 END) AS admis,
      SUM(CASE WHEN n.valeur  < 10 THEN 1 ELSE 0 END) AS echec
    FROM classes c
    LEFT JOIN students s ON s.classe_id = c.id
    LEFT JOIN notes    n ON n.student_id = s.id
      AND n.annee_scolaire = ?
      AND n.statut = 'valide'
  `
  const params = [annee_scolaire]
  if (trimestre) { query += ' AND n.trimestre = ?'; params.push(trimestre) }
  query += ' GROUP BY c.id, c.nom ORDER BY c.nom'

  const [rows] = await db.execute(query, params)
  res.json({ success: true, data: rows })
})

// ── Notes par matière ────────────────────────────────────────────
const getNotesByMatiere = asyncHandler(async (req, res) => {
  const { annee_scolaire = '2024-2025', trimestre } = req.query

  let query = `
    SELECT
      m.nom                                            AS matiere,
      COUNT(n.id)                                      AS total_notes,
      COALESCE(ROUND(AVG(n.valeur), 2), 0)            AS moyenne,
      SUM(CASE WHEN n.valeur >= 10 THEN 1 ELSE 0 END) AS admis,
      SUM(CASE WHEN n.valeur  < 10 THEN 1 ELSE 0 END) AS echec
    FROM matieres m
    LEFT JOIN notes n ON n.matiere_id = m.id
      AND n.annee_scolaire = ?
      AND n.statut = 'valide'
  `
  const params = [annee_scolaire]
  if (trimestre) { query += ' AND n.trimestre = ?'; params.push(trimestre) }
  query += ' GROUP BY m.id, m.nom ORDER BY moyenne DESC'

  const [rows] = await db.execute(query, params)
  res.json({ success: true, data: rows })
})

// ── Paiements par mois ───────────────────────────────────────────
const getPaymentsByMonth = asyncHandler(async (req, res) => {
  const { annee = new Date().getFullYear() } = req.query

  const [rows] = await db.execute(`
    SELECT
      MONTH(created_at)                    AS mois_num,
      DATE_FORMAT(created_at, '%b')        AS mois,
      COALESCE(SUM(montant_total), 0)      AS attendu,
      COALESCE(SUM(montant_paye),  0)      AS paye,
      COUNT(*)                             AS nb_paiements
    FROM paiements
    WHERE YEAR(created_at) = ?
    GROUP BY MONTH(created_at), DATE_FORMAT(created_at, '%b')
    ORDER BY mois_num
  `, [annee])

  // Remplir les mois manquants avec 0
  const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  const filled = MOIS.map((m, i) => {
    const found = rows.find(r => parseInt(r.mois_num) === i + 1)
    return found
      ? { mois: m, attendu: parseFloat(found.attendu), paye: parseFloat(found.paye), nb: found.nb_paiements }
      : { mois: m, attendu: 0, paye: 0, nb: 0 }
  })

  res.json({ success: true, data: filled })
})

// ── Paiements par statut (pour Pie chart) ───────────────────────
const getPaymentsByStatut = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(`
    SELECT
      statut,
      COUNT(*)              AS nb,
      COALESCE(SUM(montant_total), 0) AS montant
    FROM paiements
    GROUP BY statut
  `)

  const map = { en_attente: 'En attente', partiel: 'Partiel', complet: 'Complet' }
  const data = rows.map(r => ({
    name:    map[r.statut] || r.statut,
    value:   r.nb,
    montant: parseFloat(r.montant),
  }))

  res.json({ success: true, data })
})

// ── Taux réussite par trimestre (Line chart) ─────────────────────
const getReussiteByTrimestre = asyncHandler(async (req, res) => {
  const { annee_scolaire = '2024-2025' } = req.query

  const [rows] = await db.execute(`
    SELECT
      trimestre,
      COUNT(*)                                         AS total,
      SUM(CASE WHEN valeur >= 10 THEN 1 ELSE 0 END)  AS admis,
      SUM(CASE WHEN valeur  < 10 THEN 1 ELSE 0 END)  AS echec,
      ROUND(AVG(valeur), 2)                           AS moyenne
    FROM notes
    WHERE annee_scolaire = ? AND statut = 'valide'
    GROUP BY trimestre
    ORDER BY trimestre
  `, [annee_scolaire])

  const data = [1, 2, 3].map(t => {
    const found = rows.find(r => parseInt(r.trimestre) === t)
    if (!found) return { trimestre: `T${t}`, taux: 0, moyenne: 0, admis: 0, echec: 0 }
    const taux = found.total > 0
      ? Math.round((found.admis / found.total) * 100) : 0
    return {
      trimestre: `T${t}`,
      taux,
      moyenne:   parseFloat(found.moyenne),
      admis:     found.admis,
      echec:     found.echec,
    }
  })

  res.json({ success: true, data })
})

// ── Récap enseignants ────────────────────────────────────────────
const getTeachersRecap = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(`
    SELECT
      u.nom, u.prenom, u.email,
      c.nom                                        AS classe_nom,
      COUNT(DISTINCT n.id)                         AS nb_notes,
      COALESCE(ROUND(AVG(n.valeur), 2), 0)        AS moyenne_notes,
      GROUP_CONCAT(DISTINCT m.nom ORDER BY m.nom SEPARATOR ', ') AS matieres,
      s.statut AS salaire_statut,
      s.montant AS salaire_montant
    FROM users u
    LEFT JOIN classes           c  ON u.classe_id    = c.id
    LEFT JOIN notes             n  ON n.teacher_id   = u.id
    LEFT JOIN teacher_matieres  tm ON tm.teacher_id  = u.id
    LEFT JOIN matieres          m  ON tm.matiere_id  = m.id
    LEFT JOIN salaires          s  ON s.teacher_id   = u.id
      AND s.annee = YEAR(NOW())
      AND s.mois  = LPAD(MONTH(NOW()), 2, '0')
    WHERE u.role = 'teacher' AND u.statut = 'actif'
    GROUP BY u.id, u.nom, u.prenom, u.email, c.nom, s.statut, s.montant
    ORDER BY u.nom
  `)
  res.json({ success: true, data: rows })
})

module.exports = {
  getOverview,
  getNotesByClasse,
  getNotesByMatiere,
  getPaymentsByMonth,
  getPaymentsByStatut,
  getReussiteByTrimestre,
  getTeachersRecap,
}