const express =require('express')
const { updateFacultyDetails } = require('../admin/edit')
const { facultyCreation, facultyPassForgot, facultyLogin, fPassReset, fChangePassword, facultyPosition, positionSend, officerFaculty, facultyPositionAssi, viewAllFacultyPositions } = require('../controllers/facultyAuth')
const { uploadFacultyPhoto } = require('../middleware/faculty')
const router= express.Router()

router.post('/create',facultyCreation)
router.post('/forget',facultyPassForgot)
router.post('/login',facultyLogin)
router.post('/reset', fPassReset)
router.put('/change',fChangePassword)
router.patch('/update',uploadFacultyPhoto,updateFacultyDetails)
router.post('/position',facultyPosition)
router.get('/send',positionSend)
router.get('/officer',officerFaculty)
router.post('/position_assi',facultyPositionAssi)
router.get('/view',viewAllFacultyPositions)

module.exports=router