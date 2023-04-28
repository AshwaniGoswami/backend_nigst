const express= require('express')
const {  getpdf, pdf_Upload } = require('../controllers/pdfController')
const { pdfUpload } = require('../middleware/faculty')

const router=express.Router()

router.post('/pu',pdfUpload,pdf_Upload)
router.get('/pg/:id',pdfUpload,getpdf)

module.exports=router