const PaymentModel = require('../models/paymentModel')
const asyncHandler = require('../utils/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const payments = await PaymentModel.getAll({
    statut: req.query.statut || '',
    search: req.query.search || '',
  })
  res.json({ success: true, data: payments })
})

const getByStudent = asyncHandler(async (req, res) => {
  const payments = await PaymentModel.getByStudent(req.params.student_id)
  res.json({ success: true, data: payments })
})

const getMine = asyncHandler(async (req, res) => {
  const payments = await PaymentModel.getByParent(req.user.id)
  res.json({ success: true, data: payments })
})

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body }
  if (req.file) data.recu_image = req.file.path.replace(/\\/g, '/')

  if (!data.parent_id || !data.student_id || !data.montant_total)
    return res.status(400).json({ success: false, message: 'Champs requis manquants.' })

  const id = await PaymentModel.create(data)
  res.status(201).json({ success: true, data: { id }, message: 'Paiement enregistré.' })
})

const addTranche = asyncHandler(async (req, res) => {
  const { montant_tranche } = req.body
  if (!montant_tranche || isNaN(montant_tranche))
    return res.status(400).json({ success: false, message: 'Montant de tranche invalide.' })

  const recu_image = req.file ? req.file.path.replace(/\\/g, '/') : null
  const updated = await PaymentModel.addTranche(req.params.id, montant_tranche, recu_image)
  if (!updated)
    return res.status(404).json({ success: false, message: 'Paiement introuvable.' })

  res.json({ success: true, data: updated, message: 'Tranche ajoutée.' })
})

const remove = asyncHandler(async (req, res) => {
  const affected = await PaymentModel.delete(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Paiement introuvable.' })
  res.json({ success: true, message: 'Paiement supprimé.' })
})

module.exports = { getAll, getByStudent, getMine, create, addTranche, remove }