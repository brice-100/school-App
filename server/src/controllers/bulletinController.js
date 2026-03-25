const PDFDocument   = require('pdfkit')
const GradeModel    = require('../models/gradeModel')
const asyncHandler  = require('../utils/asyncHandler')
const db            = require('../config/db')

// ── Données bulletin ─────────────────────────────────────────────
const getBulletinData = asyncHandler(async (req, res) => {
  const { student_id } = req.params
  const { trimestre = 1, annee_scolaire = '2024-2025' } = req.query

  // Infos élève
  const [students] = await db.execute(`
    SELECT s.id, s.nom, s.prenom, s.date_naissance, s.photo,
           c.nom AS classe_nom, c.niveau,
           u.nom AS parent_nom, u.prenom AS parent_prenom, u.telephone
    FROM students s
    LEFT JOIN classes c ON s.classe_id = c.id
    LEFT JOIN users   u ON s.parent_id = u.id
    WHERE s.id = ?
  `, [student_id])

  if (!students[0])
    return res.status(404).json({ success: false, message: 'Élève introuvable.' })

  const student = students[0]
  const notes   = await GradeModel.getByStudent(student_id, trimestre, annee_scolaire)

  // Calculs
  const validees    = notes.filter(n => n.statut === 'valide')
  const moyenne     = validees.length
    ? (validees.reduce((s, n) => s + parseFloat(n.valeur), 0) / validees.length).toFixed(2)
    : null
  const mention     = getMention(parseFloat(moyenne))
  const admis       = moyenne !== null && parseFloat(moyenne) >= 10

  res.json({
    success: true,
    data: {
      student,
      notes,
      trimestre,
      annee_scolaire,
      moyenne,
      mention,
      admis,
      nb_matieres:  validees.length,
    }
  })
})

// ── Génération PDF ───────────────────────────────────────────────
const generatePDF = asyncHandler(async (req, res) => {
  const { student_id } = req.params
  const { trimestre = 1, annee_scolaire = '2024-2025' } = req.query

  // Récupérer les données
  const [students] = await db.execute(`
    SELECT s.id, s.nom, s.prenom, s.date_naissance,
           c.nom AS classe_nom, c.niveau,
           u.nom AS parent_nom, u.prenom AS parent_prenom
    FROM students s
    LEFT JOIN classes c ON s.classe_id = c.id
    LEFT JOIN users   u ON s.parent_id = u.id
    WHERE s.id = ?
  `, [student_id])

  if (!students[0])
    return res.status(404).json({ success: false, message: 'Élève introuvable.' })

  const student = students[0]
  const notes   = await GradeModel.getByStudent(student_id, trimestre, annee_scolaire)
  const validees = notes.filter(n => n.statut === 'valide')
  const moyenne  = validees.length
    ? (validees.reduce((s, n) => s + parseFloat(n.valeur), 0) / validees.length).toFixed(2)
    : '—'
  const mention  = getMention(parseFloat(moyenne))

  // ── Créer le PDF ────────────────────────────────────────────
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=bulletin_${student.nom}_${student.prenom}_T${trimestre}.pdf`
  )
  doc.pipe(res)

  const W = doc.page.width - 100  // largeur utile
  const BLEU = '#1E3A5F'
  const GRIS = '#F5F5F5'

  // ── EN-TÊTE ──────────────────────────────────────────────────
  doc.rect(50, 50, W, 70).fill(BLEU)
  doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
     .text('BULLETIN SCOLAIRE', 50, 65, { width: W, align: 'center' })
  doc.fontSize(11).font('Helvetica')
     .text(`Année scolaire ${annee_scolaire}  •  Trimestre ${trimestre}`, 50, 88, { width: W, align: 'center' })

  // ── INFOS ÉLÈVE ──────────────────────────────────────────────
  doc.fillColor(BLEU).fontSize(11).font('Helvetica-Bold')
     .text('INFORMATIONS ÉLÈVE', 50, 140)
  doc.moveTo(50, 155).lineTo(W + 50, 155).lineWidth(1).strokeColor(BLEU).stroke()

  doc.fillColor('#333').fontSize(10).font('Helvetica')
  const col1 = 50, col2 = 300
  doc.text(`Nom :`,          col1, 162).font('Helvetica-Bold').text(`${student.prenom} ${student.nom}`, col1 + 60, 162)
  doc.font('Helvetica').text(`Classe :`,       col1, 178).font('Helvetica-Bold').text(student.classe_nom || '—', col1 + 60, 178)
  doc.font('Helvetica').text(`Niveau :`,       col2, 162).font('Helvetica-Bold').text(student.niveau || '—', col2 + 60, 162)
  doc.font('Helvetica').text(`Parent :`,       col2, 178).font('Helvetica-Bold')
     .text(`${student.parent_prenom || ''} ${student.parent_nom || ''}`.trim() || '—', col2 + 60, 178)

  // ── TABLEAU DES NOTES ────────────────────────────────────────
  doc.fillColor(BLEU).fontSize(11).font('Helvetica-Bold')
     .text('RÉSULTATS PAR MATIÈRE', 50, 215)
  doc.moveTo(50, 230).lineTo(W + 50, 230).lineWidth(1).strokeColor(BLEU).stroke()

  // En-tête tableau
  const colW  = [240, 80, 80, W - 400]
  const cols  = [50, 290, 370, 450]
  let   y     = 238

  doc.rect(50, y, W, 20).fill(BLEU)
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
  ;['Matière', 'Note /20', 'Statut', 'Commentaire'].forEach((h, i) => {
    doc.text(h, cols[i] + 4, y + 5, { width: colW[i] - 8 })
  })
  y += 20

  // Lignes notes
  doc.font('Helvetica').fontSize(9)
  notes.forEach((note, idx) => {
    const bg = idx % 2 === 0 ? GRIS : 'white'
    doc.rect(50, y, W, 18).fill(bg)
    doc.fillColor('#333')
    doc.text(note.matiere_nom,                             cols[0] + 4, y + 4, { width: colW[0] - 8 })
    doc.text(parseFloat(note.valeur).toFixed(2),           cols[1] + 4, y + 4, { width: colW[1] - 8, align: 'center' })

    const statutColor = note.statut === 'valide' ? '#15803d' : '#92400e'
    doc.fillColor(statutColor)
       .text(note.statut === 'valide' ? '✓ Validée' : '⏳ Brouillon', cols[2] + 4, y + 4, { width: colW[2] - 8 })
    doc.fillColor('#666')
       .text(note.commentaire || '—', cols[3] + 4, y + 4, { width: colW[3] - 8 })
    y += 18
  })

  if (notes.length === 0) {
    doc.rect(50, y, W, 24).fill(GRIS)
    doc.fillColor('#666').text('Aucune note enregistrée pour ce trimestre.', 50, y + 6, { width: W, align: 'center' })
    y += 24
  }

  // ── RÉCAPITULATIF ────────────────────────────────────────────
  y += 20
  doc.rect(50, y, W, 70).fill('#EEF3FA')
  doc.rect(50, y, W, 70).lineWidth(1).strokeColor(BLEU).stroke()

  doc.fillColor(BLEU).fontSize(11).font('Helvetica-Bold')
     .text('RÉCAPITULATIF', 60, y + 10)

  const moy    = parseFloat(moyenne)
  const color  = isNaN(moy) ? '#666' : moy >= 10 ? '#15803d' : '#dc2626'

  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text(`Moyenne générale :`, 60, y + 28)
  doc.fillColor(color).fontSize(14).font('Helvetica-Bold')
     .text(isNaN(moy) ? '—' : `${moyenne} / 20`, 200, y + 25)

  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text(`Mention :`, 60, y + 46)
  doc.fillColor(BLEU).font('Helvetica-Bold')
     .text(mention, 200, y + 46)

  doc.fillColor('#333').font('Helvetica')
     .text(`Décision :`, 340, y + 28)
  doc.fillColor(color).font('Helvetica-Bold')
     .text(isNaN(moy) ? '—' : moy >= 10 ? 'ADMIS(E)' : 'NON ADMIS(E)', 420, y + 28)

  // ── SIGNATURES ───────────────────────────────────────────────
  y += 90
  doc.moveTo(50,  y).lineTo(200,  y).lineWidth(0.5).strokeColor('#999').stroke()
  doc.moveTo(350, y).lineTo(500, y).stroke()
  doc.fillColor('#666').fontSize(9).font('Helvetica')
     .text('Le Directeur',     50,  y + 4)
     .text('Parent / Tuteur', 350, y + 4)

  // ── PIED DE PAGE ─────────────────────────────────────────────
  doc.rect(50, doc.page.height - 50, W, 25).fill(BLEU)
  doc.fillColor('white').fontSize(8)
     .text(
       `Document généré le ${new Date().toLocaleDateString('fr-FR')} • ÉcoleManager`,
       50, doc.page.height - 43,
       { width: W, align: 'center' }
     )

  doc.end()
})

// ── Helper mention ───────────────────────────────────────────────
function getMention(moyenne) {
  if (isNaN(moyenne))        return '—'
  if (moyenne >= 16)         return 'Très Bien'
  if (moyenne >= 14)         return 'Bien'
  if (moyenne >= 12)         return 'Assez Bien'
  if (moyenne >= 10)         return 'Passable'
  return 'Insuffisant'
}

module.exports = { getBulletinData, generatePDF }