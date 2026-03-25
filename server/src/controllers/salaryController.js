const SalaryModel  = require('../models/salaryModel')
const asyncHandler = require('../utils/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const { annee, statut } = req.query
  const teacher_id = req.user.role === 'teacher' ? req.user.id : req.query.teacher_id
  const salaries = await SalaryModel.getAll({ teacher_id, annee, statut })
  res.json({ success: true, data: salaries })
})

const getRecap = asyncHandler(async (req, res) => {
  const { mois, annee } = req.query
  if (!mois || !annee)
    return res.status(400).json({ success: false, message: 'Mois et année requis.' })
  const recap = await SalaryModel.getRecap(mois, annee)
  res.json({ success: true, data: recap })
})

const create = asyncHandler(async (req, res) => {
  const { teacher_id, montant, mois, annee } = req.body
  if (!teacher_id || !montant || !mois || !annee)
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' })
  const id = await SalaryModel.create(req.body)
  res.status(201).json({ success: true, data: { id }, message: 'Fiche créée.' })
})

// Générer fiches pour tous les enseignants d'un mois
const genererMois = asyncHandler(async (req, res) => {
  const { mois, annee, montant_defaut } = req.body
  if (!mois || !annee || !montant_defaut)
    return res.status(400).json({ success: false, message: 'Mois, année et montant requis.' })
  const nb = await SalaryModel.genererMois(mois, annee, montant_defaut)
  res.json({ success: true, message: `${nb} fiche(s) générée(s).` })
})

// Marquer comme payé
const payer = asyncHandler(async (req, res) => {
  const affected = await SalaryModel.payer(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Fiche introuvable.' })
  res.json({ success: true, message: 'Salaire marqué comme payé.' })
})

const update = asyncHandler(async (req, res) => {
  const affected = await SalaryModel.update(req.params.id, req.body)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Fiche introuvable.' })
  res.json({ success: true, message: 'Fiche mise à jour.' })
})

const remove = asyncHandler(async (req, res) => {
  const affected = await SalaryModel.delete(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Fiche introuvable.' })
  res.json({ success: true, message: 'Fiche supprimée.' })
})

module.exports = { getAll, getRecap, create, genererMois, payer, update, remove }