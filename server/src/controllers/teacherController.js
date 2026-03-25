const TeacherModel = require('../models/teacherModel');

const getAll = async (req, res) => {
  try {
    const teachers = await TeacherModel.getAll({ search: req.query.search || '' });
    res.json({ success: true, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getById = async (req, res) => {
  try {
    const teacher = await TeacherModel.getById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Enseignant introuvable.' });
    res.json({ success: true, data: teacher });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const create = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.path.replace(/\\/g, '/');
    if (!data.nom || !data.prenom || !data.email || !data.mot_de_passe) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants.' });
    }
    const id = await TeacherModel.create(data);
    if (data.matiere_id) await TeacherModel.assignMatiere(id, data.matiere_id);
    const teacher = await TeacherModel.getById(id);
    res.status(201).json({ success: true, data: teacher, message: 'Enseignant créé.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.path.replace(/\\/g, '/');
    await TeacherModel.update(req.params.id, data);
    const teacher = await TeacherModel.getById(req.params.id);
    res.json({ success: true, data: teacher, message: 'Enseignant mis à jour.' });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const remove = async (req, res) => {
  try {
    const affected = await TeacherModel.delete(req.params.id);
    if (!affected) return res.status(404).json({ success: false, message: 'Enseignant introuvable.' });
    res.json({ success: true, message: 'Enseignant supprimé.' });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, getById, create, update, remove };