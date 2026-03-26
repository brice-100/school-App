const TeacherModel = require('../models/teacherModel')
const asyncHandler = require('../utils/asyncHandler')
const db           = require('../config/db')
const fs           = require('fs')
const path         = require('path')

const getAll = asyncHandler(async (req, res) => {
  const teachers = await TeacherModel.getAll({ search: req.query.search || '' })
  res.json({ success: true, data: teachers })
})

const getById = asyncHandler(async (req, res) => {
  const teacher = await TeacherModel.getById(req.params.id)
  if (!teacher)
    return res.status(404).json({ success: false, message: 'Enseignant introuvable.' })
  res.json({ success: true, data: teacher })
})

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body }
  if (req.file) data.photo = req.file.path.replace(/\\/g, '/')

  if (!data.nom || !data.prenom || !data.email || !data.mot_de_passe)
    return res.status(400).json({
      success: false,
      message: 'Nom, prénom, email et mot de passe sont requis.',
    })

  // Vérifier email unique
  const [existing] = await db.execute(
    'SELECT id FROM users WHERE email = ?', [data.email]
  )
  if (existing.length)
    return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' })

  const id = await TeacherModel.create(data)

  // Sync matières si fournie
  if (data.matiere_id) {
    const ids = Array.isArray(data.matiere_id) ? data.matiere_id : [data.matiere_id]
    await TeacherModel.syncMatieres(id, ids)
  }

  const teacher = await TeacherModel.getById(id)
  res.status(201).json({ success: true, data: teacher, message: 'Enseignant créé.' })
})

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body }
  if (req.file) data.photo = req.file.path.replace(/\\/g, '/')

  // Supprimer ancienne photo si nouvelle uploadée
  if (req.file) {
    const existing = await TeacherModel.getById(req.params.id)
    if (existing?.photo) {
      const oldPath = path.join(__dirname, '../../', existing.photo)
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath) } catch (e) { /* ignorer */ }
      }
    }
  }

  await TeacherModel.update(req.params.id, data)

  // Sync matières si fournie (même si vide = supprimer toutes)
  if (data.matiere_id !== undefined) {
    const ids = data.matiere_id === ''
      ? []
      : Array.isArray(data.matiere_id)
        ? data.matiere_id
        : [data.matiere_id]
    await TeacherModel.syncMatieres(req.params.id, ids)
  }

  const teacher = await TeacherModel.getById(req.params.id)
  if (!teacher)
    return res.status(404).json({ success: false, message: 'Enseignant introuvable.' })

  res.json({ success: true, data: teacher, message: 'Enseignant mis à jour.' })
})

const remove = asyncHandler(async (req, res) => {
  const teacher = await TeacherModel.getById(req.params.id)
  if (!teacher)
    return res.status(404).json({ success: false, message: 'Enseignant introuvable.' })

  if (teacher.photo) {
    const filePath = path.join(__dirname, '../../', teacher.photo)
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (e) { /* ignorer */ }
    }
  }

  await TeacherModel.delete(req.params.id)
  res.json({ success: true, message: 'Enseignant supprimé.' })
})

module.exports = { getAll, getById, create, update, remove }