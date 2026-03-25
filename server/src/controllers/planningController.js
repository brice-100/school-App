const PlanningModel = require('../models/planningModel')
const asyncHandler  = require('../utils/asyncHandler')
const db            = require('../config/db')

const getByClasse = asyncHandler(async (req, res) => {
  const data = await PlanningModel.getByClasse(req.params.classe_id)
  res.json({ success: true, data })
})

const getByTeacher = asyncHandler(async (req, res) => {
  const teacher_id = req.user.role === 'teacher'
    ? req.user.id
    : req.params.teacher_id
  const data = await PlanningModel.getByTeacher(teacher_id)
  res.json({ success: true, data })
})

// Données nécessaires pour remplir le formulaire planning
const getFormData = asyncHandler(async (req, res) => {
  const [classes]  = await db.execute(
    'SELECT id, nom, niveau FROM classes ORDER BY nom'
  )
  const [matieres] = await db.execute(
    'SELECT id, nom FROM matieres ORDER BY nom'
  )
  const [teachers] = await db.execute(
    "SELECT id, nom, prenom FROM users WHERE role = 'teacher' AND statut = 'actif' ORDER BY nom"
  )
  res.json({ success: true, data: { classes, matieres, teachers } })
})

const create = asyncHandler(async (req, res) => {
  const { classe_id, matiere_id, teacher_id, jour, heure_debut, heure_fin } = req.body

  if (!classe_id || !matiere_id || !teacher_id || !jour || !heure_debut || !heure_fin)
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' })

  if (heure_debut >= heure_fin)
    return res.status(400).json({
      success: false,
      message: "L'heure de fin doit être après l'heure de début.",
    })

  const id = await PlanningModel.create(req.body)
  res.status(201).json({ success: true, data: { id }, message: 'Créneau ajouté.' })
})

const update = asyncHandler(async (req, res) => {
  const affected = await PlanningModel.update(req.params.id, req.body)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Créneau introuvable.' })
  res.json({ success: true, message: 'Créneau mis à jour.' })
})

const remove = asyncHandler(async (req, res) => {
  const affected = await PlanningModel.delete(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Créneau introuvable.' })
  res.json({ success: true, message: 'Créneau supprimé.' })
})

module.exports = { getByClasse, getByTeacher, getFormData, create, update, remove }