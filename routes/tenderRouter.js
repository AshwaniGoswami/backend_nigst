const express=require("express")
const { tenderCreation, archiveTender, retrieveTender, viewTender, getTenderNo, downloadPdf, viewPdf, addCorrigendum, viewCorriPdf, viewArchiveTender, viewArchivePdf,  } = require("../controllers/tender")
const { tenderpdf, corrigendum } = require("../middleware/faculty")
const router = express.Router()
router.post('/create',tenderpdf,tenderCreation)
router.patch('/archive',archiveTender)
router.post('/retrieve',retrieveTender)
router.get('/view',viewTender)
router.post('/corrigendum',corrigendum,addCorrigendum)
router.get('/corri_pdf/:corrigendumID',viewCorriPdf)
router.get('/refNo',getTenderNo)
router.get('/vpdf/:tender_number',viewPdf)
router.get('/view_archive',viewArchiveTender)
router.get('/view_archive/:tender_number',viewArchivePdf)
router.get('/dpdf/:id',downloadPdf)
module.exports=router