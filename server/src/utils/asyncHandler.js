// Enveloppe automatiquement chaque controller async
// et envoie l'erreur au middleware global si ça plante
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('[ASYNC ERROR]', err.message)
    console.error('[SQL CODE]',   err.code)     // ex: ER_NO_SUCH_TABLE
    console.error('[SQL MSG]',    err.sqlMessage)
    next(err)
  })
}

module.exports = asyncHandler