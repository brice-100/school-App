const StudentModel = require('../models/studentModel');
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const { search, classe_id } = req.query;
    const students = await StudentModel.getAll({ search, classe_id });
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('[STUDENT getAll]', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getById = async (req, res) => {
  try {
    const student = await StudentModel.getById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Élève introuvable.' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const create = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.path.replace(/\\/g, '/');

    if (!data.nom || !data.prenom) {
      return res.status(400).json({ success: false, message: 'Nom et prénom requis.' });
    }

    const id = await StudentModel.create(data);
    const student = await StudentModel.getById(id);
    res.status(201).json({ success: true, data: student, message: 'Élève créé avec succès.' });
  } catch (err) {
    console.error('[STUDENT create]', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.path.replace(/\\/g, '/');

    const affected = await StudentModel.update(req.params.id, data);
    if (!affected) return res.status(404).json({ success: false, message: 'Élève introuvable.' });

    const student = await StudentModel.getById(req.params.id);
    res.json({ success: true, data: student, message: 'Élève mis à jour.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const remove = async (req, res) => {
  try {
    // Supprimer la photo si elle existe
    const student = await StudentModel.getById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Élève introuvable.' });
    if (student.photo) {
      const filePath = path.join(__dirname, '../../', student.photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await StudentModel.delete(req.params.id);
    res.json({ success: true, message: 'Élève supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, getById, create, update, remove };