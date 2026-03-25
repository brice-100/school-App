const ParentModel    = require('../models/parentModel')
const asyncHandler   = require('../utils/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const parents = await ParentModel.getAll({ search: req.query.search || '' })
  res.json({ success: true, data: parents })
})

const getById = asyncHandler(async (req, res) => {
  const parent = await ParentModel.getById(req.params.id)
  if (!parent) return res.status(404).json({ success: false, message: 'Parent introuvable.' })
  res.json({ success: true, data: parent })
})

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body }
  if (req.file) data.photo = req.file.path.replace(/\\/g, '/')

  if (!data.nom || !data.prenom || !data.telephone)
    return res.status(400).json({ success: false, message: 'Nom, prénom et téléphone requis.' })

  const result = await ParentModel.create(data)
  const parent = await ParentModel.getById(result.id)
  res.status(201).json({
    success: true,
    data: parent,
    generatedPassword: result.generatedPassword,
    message: 'Parent créé.',
  })
})

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body }
  if (req.file) data.photo = req.file.path.replace(/\\/g, '/')
  await ParentModel.update(req.params.id, data)
  const parent = await ParentModel.getById(req.params.id)
  res.json({ success: true, data: parent, message: 'Parent mis à jour.' })
})

const remove = asyncHandler(async (req, res) => {
  const affected = await ParentModel.delete(req.params.id)
  if (!affected) return res.status(404).json({ success: false, message: 'Parent introuvable.' })
  res.json({ success: true, message: 'Parent supprimé.' })
})

module.exports = { getAll, getById, create, update, remove }