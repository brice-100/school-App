const GradeModel   = require('../models/gradeModel')
const asyncHandler = require('../utils/asyncHandler')
const db           = require('../config/db')

// Données formulaire pour l'enseignant
const getFormData = asyncHandler(async (req, res) => {
  const teacher_id = req.user.id

  // Les élèves des classes de cet enseignant
  const [students] = await db.execute(`
    SELECT DISTINCT s.id, s.nom, s.prenom, c.nom AS classe_nom, c.id AS classe_id
    FROM students s
    JOIN classes c ON s.classe_id = c.id
    JOIN planning p ON p.classe_id = c.id AND p.teacher_id = ?
    ORDER BY c.nom, s.nom
  `, [teacher_id])

  // Les matières de cet enseignant
  const [matieres] = await db.execute(`
    SELECT DISTINCT m.id, m.nom
    FROM matieres m
    JOIN teacher_matieres tm ON tm.matiere_id = m.id
    WHERE tm.teacher_id = ?
    ORDER BY m.nom
  `, [teacher_id])

  // Si aucune matière via teacher_matieres, retourner toutes
  let finalMatieres = matieres
  if (!matieres.length) {
    const [all] = await db.execute('SELECT id, nom FROM matieres ORDER BY nom')
    finalMatieres = all
  }

  // Si aucun élève via planning, retourner tous
  let finalStudents = students
  if (!students.length) {
    const [all] = await db.execute(`
      SELECT s.id, s.nom, s.prenom, c.nom AS classe_nom, c.id AS classe_id
      FROM students s
      LEFT JOIN classes c ON s.classe_id = c.id
      ORDER BY c.nom, s.nom
    `)
    finalStudents = all
  }

  res.json({ success: true, data: { students: finalStudents, matieres: finalMatieres } })
})

const getAll = asyncHandler(async (req, res) => {
  const { classe_id, matiere_id, trimestre, annee_scolaire } = req.query

  // Enseignant voit seulement ses notes | Admin voit tout
  const teacher_id = req.user.role === 'teacher' ? req.user.id : req.query.teacher_id

  const grades = await GradeModel.getAll({
    classe_id, matiere_id, trimestre, annee_scolaire, teacher_id,
  })
  res.json({ success: true, data: grades })
})

const getByStudent = asyncHandler(async (req, res) => {
  const { trimestre, annee_scolaire } = req.query
  const grades = await GradeModel.getByStudent(
    req.params.student_id, trimestre, annee_scolaire
  )
  res.json({ success: true, data: grades })
})

const getStats = asyncHandler(async (req, res) => {
  const { trimestre = 1, annee_scolaire = '2024-2025' } = req.query
  const stats = await GradeModel.getStats(
    req.params.classe_id, trimestre, annee_scolaire
  )
  res.json({ success: true, data: stats })
})

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body }

  // Forcer teacher_id = l'enseignant connecté
  if (req.user.role === 'teacher') data.teacher_id = req.user.id

  const { student_id, matiere_id, teacher_id, valeur, trimestre } = data
  if (!student_id || !matiere_id || !teacher_id || valeur === undefined || !trimestre)
    return res.status(400).json({ success: false, message: 'Champs requis manquants.' })

  if (parseFloat(valeur) < 0 || parseFloat(valeur) > 20)
    return res.status(400).json({ success: false, message: 'Note entre 0 et 20.' })

  const id = await GradeModel.create(data)
  res.status(201).json({ success: true, data: { id }, message: 'Note enregistrée.' })
})

const update = asyncHandler(async (req, res) => {
  if (req.body.valeur !== undefined) {
    if (parseFloat(req.body.valeur) < 0 || parseFloat(req.body.valeur) > 20)
      return res.status(400).json({ success: false, message: 'Note entre 0 et 20.' })
  }
  const affected = await GradeModel.update(req.params.id, req.body)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Note introuvable.' })
  res.json({ success: true, message: 'Note mise à jour.' })
})

const valider = asyncHandler(async (req, res) => {
  const { ids } = req.body
  if (!ids || !Array.isArray(ids) || !ids.length)
    return res.status(400).json({ success: false, message: 'IDs requis.' })
  await GradeModel.valider(ids)
  res.json({ success: true, message: `${ids.length} note(s) validée(s).` })
})

const remove = asyncHandler(async (req, res) => {
  const affected = await GradeModel.delete(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Note introuvable.' })
  res.json({ success: true, message: 'Note supprimée.' })
})

module.exports = { getFormData, getAll, getByStudent, getStats, create, update, valider, remove }